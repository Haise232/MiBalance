import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Dialogo from '@/componentes/Dialogo';
import { ContenedorPantalla } from '@/componentes/ContenedorPantalla';
import { AUTOFOCUS_WEB, COMPORTAMIENTO_TECLADO } from '@/constantes/plataforma';
import { useDiseno } from '@/hooks/useDiseno';
import { supabase } from '@/servicios/supabase';
import { useTheme, useWebTexture, Fonts, Radius } from '@/constantes/tema';

// ─── Error modal ─────────────────────────────────────────────────────────────

interface ErrorModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

function ErrorModal({ visible, title, message, onClose }: ErrorModalProps) {
  const c = useTheme();
  return (
    <Dialogo
      visible={visible}
      onClose={onClose}
      estiloFondo={ms.overlay}
      estiloCaja={[ms.sheet, { backgroundColor: c.surface, borderColor: c.line }]}
      estiloCajaAncho={ms.sheetWide}
      anchoMax={440}
    >
      {/* Icono de error */}
      <View style={[ms.iconWrap, { backgroundColor: c.negSoft }]}>
        <Text style={[ms.iconGlyph, { color: c.neg, fontFamily: Fonts.serif }]}>!</Text>
      </View>

      {/* Texto */}
      <Text style={[ms.title, { color: c.ink, fontFamily: Fonts.serif }]}>{title}</Text>
      <Text style={[ms.body, { color: c.ink3 }]}>{message}</Text>

      {/* Botón */}
      <TouchableOpacity
        style={[ms.btn, { backgroundColor: c.ink }]}
        onPress={onClose}
        activeOpacity={0.85}
      >
        <Text style={[ms.btnText, { color: c.bg }]}>Volver a intentarlo</Text>
      </TouchableOpacity>
    </Dialogo>
  );
}

const ms = StyleSheet.create({
  overlay: {
    justifyContent: 'flex-end',
  },
  sheetWide: { paddingBottom: 32 },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 0.5,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 44,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconGlyph: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  btn: {
    width: '100%',
    height: 52,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const c = useTheme();
  const texture = useWebTexture();
  const router = useRouter();
  const { esAncho: isWide } = useDiseno();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
  const pwdRef = useRef<TextInput>(null);

  async function handleLogin() {
    if (loading) return;
    if (!email || !pwd) {
      setErrorModal({ title: 'Campos vacíos', message: 'Escribe tu correo y contraseña para continuar.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pwd });
    setLoading(false);
    if (error) {
      const isUnverified = error.message.toLowerCase().includes('email not confirmed')
        || error.message.toLowerCase().includes('not confirmed');
      setErrorModal(isUnverified
        ? {
            title: 'Correo sin verificar',
            message: 'Tienes que confirmar tu correo electrónico antes de iniciar sesión.\nRevisa tu bandeja de entrada (y la carpeta de spam).',
          }
        : {
            title: 'Credenciales incorrectas',
            message: 'El correo o la contraseña no son correctos.\nRevísalos y vuelve a intentarlo.',
          }
      );
      return;
    }
    router.replace('/');
  }

  const s = styles(c);

  const form = (
    <>
      {/* Brand */}
      <View style={s.brandWrap}>
        <View style={s.brandIcon}>
          <Image
            source={require('@/assets/logo/logo-mark.png')}
            style={s.brandIconImage}
            contentFit="cover"
          />
        </View>
        <Text style={s.brandName}>MiBalance</Text>
      </View>

      {/* Headline */}
      <Text style={s.h1}>
        Bienvenido{' '}
        <Text style={[s.h1, { color: c.accent, fontStyle: 'italic' }]}>de vuelta.</Text>
      </Text>
      <Text style={s.sub}>Tus finanzas te están esperando.</Text>

      {/* Fields */}
      <Field label="Correo electrónico" value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" placeholder="tu@correo.com" c={c}
        autoFocus={AUTOFOCUS_WEB} returnKeyType="next" blurOnSubmit={false}
        onSubmitEditing={() => pwdRef.current?.focus()} />

      <Field label="Contraseña" value={pwd} onChangeText={setPwd}
        secureTextEntry={!showPwd} placeholder="••••••••" c={c}
        inputRef={pwdRef} returnKeyType="go" onSubmitEditing={handleLogin}
        right={
          <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
            <Text style={s.toggle}>{showPwd ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        }
      />

      <TouchableOpacity style={s.forgotWrap}>
        <Text style={s.forgot}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {/* CTA */}
      <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
        {loading
          ? <ActivityIndicator color={c.bg} />
          : <Text style={s.btnText}>Entrar</Text>
        }
      </TouchableOpacity>

      <View style={isWide ? { height: 32 } : { flex: 1 }} />

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>¿Aún no tienes cuenta? </Text>
        <TouchableOpacity onPress={() => router.push('/registro')}>
          <Text style={s.footerLink}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[s.safe, texture]}>
      <KeyboardAvoidingView behavior={COMPORTAMIENTO_TECLADO} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={isWide ? s.scrollWide : s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {isWide ? (
            <View style={s.wideWrap}>
              <View style={s.wideCard}>{form}</View>
              <View style={s.wideAside}>
                <Text style={s.asideGlyph}>€</Text>
                <Text style={s.asideTitle}>Controla tu dinero{'\n'}con claridad.</Text>
                <Text style={s.asideSub}>
                  Registra tus ingresos y gastos, sigue tus objetivos y toma decisiones
                  con una vista completa de tu balance.
                </Text>
              </View>
            </View>
          ) : <ContenedorPantalla variante="auth" style={{ flex: 0, flexGrow: 1 }}>{form}</ContenedorPantalla>}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error modal */}
      <ErrorModal
        visible={!!errorModal}
        title={errorModal?.title ?? ''}
        message={errorModal?.message ?? ''}
        onClose={() => setErrorModal(null)}
      />
    </SafeAreaView>
  );
}

function Field({
  label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, right, c,
  inputRef, autoFocus, returnKeyType, onSubmitEditing, blurOnSubmit,
}: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 11, color: c.ink3, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.line,
        borderRadius: Radius.sm, paddingHorizontal: 14, paddingVertical: 14,
      }}>
        <TextInput
          style={{ flex: 1, fontSize: 15, color: c.ink, fontFamily: Fonts.sans }}
          value={value} onChangeText={onChangeText} placeholder={placeholder}
          placeholderTextColor={c.ink4} secureTextEntry={secureTextEntry}
          keyboardType={keyboardType} autoCapitalize={autoCapitalize ?? 'sentences'}
          ref={inputRef} autoFocus={autoFocus} returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing} blurOnSubmit={blurOnSubmit}
        />
        {right}
      </View>
    </View>
  );
}

const styles = (c: ReturnType<typeof useTheme>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  scroll: { flexGrow: 1, padding: 28, paddingTop: 52 },
  scrollWide: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  wideWrap: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 960,
    minHeight: 560,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: c.line,
  },
  wideCard: {
    flex: 1,
    maxWidth: 440,
    backgroundColor: c.bg,
    paddingHorizontal: 48,
    paddingVertical: 56,
    justifyContent: 'center',
  },
  wideAside: {
    flex: 1,
    backgroundColor: c.accentSoft,
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  asideGlyph: {
    fontFamily: Fonts.serif, fontStyle: 'italic', fontSize: 40, color: c.accent, marginBottom: 20,
  },
  asideTitle: {
    fontFamily: Fonts.serif, fontSize: 30, lineHeight: 36, fontWeight: '400',
    letterSpacing: -0.5, color: c.ink, marginBottom: 16,
  },
  asideSub: { fontSize: 15, lineHeight: 23, color: c.ink3, maxWidth: 320 },
  brandWrap: { marginBottom: 36 },
  brandIcon: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: c.accentSoft, overflow: 'hidden', marginBottom: 14,
  },
  brandIconImage: { width: '100%', height: '100%' },
  brandName: { fontFamily: Fonts.serif, fontStyle: 'italic', fontSize: 13, color: c.ink3, letterSpacing: 0.6 },
  h1: { fontFamily: Fonts.serif, fontSize: 34, lineHeight: 38, fontWeight: '400', letterSpacing: -1, color: c.ink, marginBottom: 8 },
  sub: { color: c.ink3, fontSize: 15, marginBottom: 32, lineHeight: 22 },
  toggle: { fontSize: 12, color: c.ink3 },
  forgotWrap: { alignItems: 'flex-end', marginTop: -4, marginBottom: 24 },
  forgot: { fontSize: 13, color: c.accent },
  btn: {
    height: 52, borderRadius: Radius.pill, backgroundColor: c.ink,
    justifyContent: 'center', alignItems: 'center',
  },
  btnText: { color: c.bg, fontSize: 14, fontWeight: '500', letterSpacing: 0.2 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, paddingBottom: 8 },
  footerText: { fontSize: 14, color: c.ink3 },
  footerLink: { fontSize: 14, color: c.ink, fontWeight: '500', textDecorationLine: 'underline' },
});
