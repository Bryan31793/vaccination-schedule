package mx.salud.vacunacion.application.usecase;

import mx.salud.vacunacion.domain.model.Paciente;
import mx.salud.vacunacion.domain.model.RegistroVacunacion;
import mx.salud.vacunacion.domain.model.Vacuna;
import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;
import mx.salud.vacunacion.domain.service.VacunacionException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AplicarVacunaService implements Puertos.AplicarVacuna {

    private final Repositorios.PacienteRepository pacienteRepository;
    private final Repositorios.VacunaRepository vacunaRepository;
    private final Repositorios.RegistroVacunacionRepository registroRepository;
    private final Repositorios.ValidacionCofeprisPort cofeprisPort;
    private final Repositorios.NotificacionPort notificacionPort;

    public AplicarVacunaService(
            Repositorios.PacienteRepository pacienteRepository,
            Repositorios.VacunaRepository vacunaRepository,
            Repositorios.RegistroVacunacionRepository registroRepository,
            Repositorios.ValidacionCofeprisPort cofeprisPort,
            Repositorios.NotificacionPort notificacionPort) {
        this.pacienteRepository = pacienteRepository;
        this.vacunaRepository   = vacunaRepository;
        this.registroRepository = registroRepository;
        this.cofeprisPort       = cofeprisPort;
        this.notificacionPort   = notificacionPort;
    }

    @Override
    public RegistroVacunacion ejecutar(Comando comando) {
        Paciente paciente = pacienteRepository.buscarPorCurp(comando.curpPaciente())
                .orElseThrow(() -> new VacunacionException.PacienteNoEncontrado(comando.curpPaciente()));

        Vacuna vacuna = vacunaRepository.buscarPorId(comando.vacunaId())
                .orElseThrow(() -> new VacunacionException.VacunaNoEncontrada(comando.vacunaId()));

        if (registroRepository.existeRegistroAplicado(paciente.getId(), vacuna.getId(), comando.numeroDosis())) {
            throw new VacunacionException.RegistroDuplicado(
                    comando.curpPaciente(), comando.vacunaId(), comando.numeroDosis());
        }

        Repositorios.ValidacionCofeprisPort.ResultadoValidacion resultado =
                cofeprisPort.validar(comando.curpPaciente(), comando.vacunaId(), comando.lote());

        if (!resultado.valido()) {
            throw new VacunacionException.ValidacionCofeprisFallida(resultado.mensajeError());
        }

        RegistroVacunacion registro = RegistroVacunacion.builder()
                .paciente(paciente)
                .vacuna(vacuna)
                .numeroDosis(comando.numeroDosis())
                .lote(comando.lote())
                .unidadAplicadora(comando.unidadAplicadora())
                .observaciones(comando.observaciones())
                .build();

        registro.confirmarAplicacion();

        RegistroVacunacion guardado = registroRepository.guardar(registro);
        notificacionPort.notificarVacunacionAplicada(guardado);
        return guardado;
    }
}
