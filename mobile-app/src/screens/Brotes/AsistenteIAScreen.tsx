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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation } from '@tanstack/react-query';
import { ScreenWrapper } from '../../components/ui';
import { llmApi } from '../../api/endpoints/llm';
import { colors, typography, borderRadius, shadows } from '../../theme';
import type { AsistenteIAScreenProps } from '../../navigation/types';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  isAI?: boolean;
}

export const AsistenteIAScreen: React.FC<AsistenteIAScreenProps> = ({
  route,
}) => {
  const curp = route.params?.curp || '';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      text: '¡Hola! 👋 Soy tu asistente de vacunación con IA. Puedo responder preguntas sobre esquemas de vacunación, efectos secundarios y recomendaciones. ¿En qué puedo ayudarte?',
      isUser: false,
      isAI: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [curpInput, setCurpInput] = useState(curp);
  const flatListRef = useRef<FlatList>(null);

  const mutation = useMutation({
    mutationFn: llmApi.consultar,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.respuesta,
          isUser: false,
          isAI: data.generadaPorIa,
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: 'Lo siento, hubo un error al procesar tu consulta. Intenta de nuevo.',
          isUser: false,
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || !curpInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    mutation.mutate({
      curpPaciente: curpInput.toUpperCase(),
      pregunta: input,
    });
    setInput('');

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble,
      ]}
    >
      {!item.isUser && (
        <View style={styles.aiHeader}>
          <LinearGradient
            colors={colors.gradients.primary as unknown as [string, string]}
            style={styles.aiAvatar}
          >
            <Ionicons name="sparkles" size={14} color="#FFF" />
          </LinearGradient>
          <Text style={styles.aiLabel}>Asistente IA</Text>
        </View>
      )}
      <Text style={item.isUser ? styles.userText : styles.aiText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper gradient={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <View style={styles.container}>
          {/* CURP Input */}
          {!curp && (
            <View style={styles.curpBar}>
              <Ionicons name="card" size={18} color={colors.neutral[400]} />
              <TextInput
                style={styles.curpInput}
                placeholder="CURP del paciente"
                placeholderTextColor={colors.neutral[400]}
                value={curpInput}
                onChangeText={(v) => setCurpInput(v.toUpperCase())}
                maxLength={18}
                autoCapitalize="characters"
              />
            </View>
          )}

          {/* Messages */}
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
                <View style={styles.typingIndicator}>
                  <ActivityIndicator
                    size="small"
                    color={colors.primary[500]}
                  />
                  <Text style={styles.typingText}>
                    El asistente está pensando...
                  </Text>
                </View>
              ) : null
            }
          />

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor={colors.neutral[400]}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!input.trim() || !curpInput.trim()) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || !curpInput.trim() || mutation.isPending}
            >
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  curpBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  curpInput: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral[800],
    fontWeight: '500',
  },
  messageList: { padding: 16, paddingBottom: 8 },
  messageBubble: {
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
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary[500],
  },
  userText: {
    fontSize: 15,
    color: '#FFF',
    lineHeight: 22,
  },
  aiText: {
    fontSize: 15,
    color: colors.neutral[700],
    lineHeight: 22,
  },
  typingIndicator: {
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
  chatInput: {
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
