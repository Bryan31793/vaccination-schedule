package mx.salud.vacunacion.application.usecase;

import mx.salud.vacunacion.domain.port.in.Puertos;
import mx.salud.vacunacion.domain.port.out.Repositorios;

import org.springframework.stereotype.Service;

@Service
public class ChatbotService implements Puertos.ConsultarChatbot {

    private final Repositorios.ChatbotPort chatbotPort;

    public ChatbotService(Repositorios.ChatbotPort chatbotPort) {
        this.chatbotPort = chatbotPort;
    }

    @Override
    public Respuesta procesar(Mensaje mensaje) {
        String respuesta = chatbotPort.procesarMensaje(mensaje.texto());
        return new Respuesta(respuesta);
    }
}
