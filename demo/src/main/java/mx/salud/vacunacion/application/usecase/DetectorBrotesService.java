package mx.salud.vacunacion.application.usecase;

import mx.salud.vacunacion.domain.event.BroteDetectadoEvent;
import mx.salud.vacunacion.domain.model.AlertaBrote;
import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DetectorBrotesService implements Puertos.DetectarBrotes {

    private static final int VENTANA_DIAS = 30;

    private final Repositorios.RegistroVacunacionRepository registroRepository;
    private final Repositorios.AlertaBroteRepository alertaRepository;
    private final Repositorios.DomainEventPublisher eventPublisher;

    public DetectorBrotesService(
            Repositorios.RegistroVacunacionRepository registroRepository,
            Repositorios.AlertaBroteRepository alertaRepository,
            Repositorios.DomainEventPublisher eventPublisher) {
        this.registroRepository = registroRepository;
        this.alertaRepository   = alertaRepository;
        this.eventPublisher     = eventPublisher;
    }

    @Override
    public List<AlertaBrote> analizar(Comando comando) {
        LocalDateTime hasta = LocalDateTime.now();
        LocalDateTime desde = hasta.minusDays(VENTANA_DIAS);

        long casos = registroRepository.contarPorCategoriaYRegionYPeriodo(
                comando.categoriaVacuna(), comando.region(), desde, hasta);

        if (casos < comando.umbral()) {
            return alertaRepository.buscarPorRegion(comando.region());
        }

        AlertaBrote alerta = new AlertaBrote(
                comando.categoriaVacuna(),
                comando.region(),
                (int) casos,
                comando.umbral()
        );

        AlertaBrote guardada = alertaRepository.guardar(alerta);
        eventPublisher.publicar(new BroteDetectadoEvent(guardada));

        return alertaRepository.buscarPorRegion(comando.region());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlertaBrote> alertasActivas() {
        return alertaRepository.buscarActivas();
    }
}
