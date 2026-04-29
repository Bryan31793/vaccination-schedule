import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation } from '@tanstack/react-query';
import { chatbotApi } from '../../api/endpoints/chatbot';
import { colors, typography, borderRadius, shadows } from '../../theme';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

const MENSAJE_BIENVENIDA: ChatMessage = {
  id: '0',
  text: '¡Hola! Soy el asistente del sistema de vacunación. Puedo responder preguntas generales sobre vacunas o consultar información de la base de datos.\n\nPor ejemplo:\n• ¿Cuántos pacientes están registrados?\n• ¿Cuántas dosis de influenza se han aplicado?\n• ¿Qué vacunas están en el catálogo?',
  isUser: false,
};

export const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([MENSAJE_BIENVENIDA]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const mutation = useMutation({
    mutationFn: chatbotApi.enviarMensaje,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: data.respuesta, isUser: false },
      ]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'No se pudo conectar con el asistente. Verifica que el servidor y Ollama estén corriendo.',
          isUser: false,
        },
      ]);
    },
  });

  const handleSend = () => {
    const texto = input.trim();
    if (!texto || mutation.isPending) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: texto, isUser: true },
    ]);
    mutation.mutate({ mensaje: texto });
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.bubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
      {!item.isUser && (
        <View style={styles.aiHeader}>
          <LinearGradient
            colors={colors.gradients.primary as unknown as [string, string]}
            style={styles.aiAvatar}
          >
            <Ionicons name="sparkles" size={13} color="#FFF" />
          </LinearGradient>
          <Text style={styles.aiLabel}>Asistente IA</Text>
        </View>
      )}
      <Text style={item.isUser ? styles.userText : styles.aiText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0F5080', '#1A8AD4']} style={styles.header}>
        <Ionicons name="chatbubbles" size={22} color="#FFF" />
        <Text style={styles.headerTitle}>Chatbot IA</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Ollama</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={
            mutation.isPending ? (
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color={colors.primary[500]} />
                <Text style={styles.typingText}>El asistente está pensando...</Text>
              </View>
            ) : null
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor={colors.neutral[400]}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || mutation.isPending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || mutation.isPending}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background.primary },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    ...typography.h3,
    color: '#FFF',
    flex: 1,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  messageList: { padding: 16, paddingBottom: 12 },
  bubble: {
    maxWidth: '85%',
    borderRadius: borderRadius.lg,
    padding: 14,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary[500],
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.neutral[0],
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary[500],
  },
  userText: { fontSize: 15, color: '#FFF', lineHeight: 22 },
  aiText: { fontSize: 15, color: colors.neutral[700], lineHeight: 22 },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  typingText: {
    ...typography.bodySmall,
    color: colors.primary[500],
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.neutral[800],
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
