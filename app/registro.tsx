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
import { mostrarAviso } from '@/servicios/avisos';
import { supabase } from '@/servicios/supabase';
import { useTheme, useWebTexture, Fonts, Radius } from '@/constantes/tema';

// ─── Success modal ────────────────────────────────────────────────────────────

function SuccessModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useTheme();
  return (
    <Dialogo
      visible={visible}
      onClose={onClose}
      estiloFondo={ss.overlay}
      estiloCaja={[ss.sheet, { backgroundColor: c.surface, borderColor: c.line }]}
      estiloCajaAncho={ss.sheetWide}
      anchoMax={460}
    >
      <View style={[ss.iconWrap, { backgroundColor: c.posSoft }]}>
        <Text style={[ss.iconGlyph, { color: c.pos, fontFamily: Fonts.serif }]}>✓</Text>
      </View>

      <Text style={[ss.title, { color: c.ink, fontFamily: Fonts.serif }]}>
        ¡Cuenta creada!
      </Text>
      <Text style={[ss.body, { color: c.ink3 }]}>
        Te hemos enviado un correo de confirmación.{'\n'}
        Ábrelo y toca el enlace para activar tu cuenta antes de iniciar sesión.
      </Text>

      <View style={[ss.hint, { backgroundColor: c.surface2, borderColor: c.line }]}>
        <Text style={[ss.hintText, { color: c.ink3 }]}>
          Si no lo ves, revisa la carpeta de{' '}
          <Text style={{ color: c.ink, fontWeight: '500' }}>spam</Text>.
        </Text>
      </View>

      <TouchableOpacity
        style={[ss.btn, { backgroundColor: c.ink }]}
        onPress={onClose}
        activeOpacity={0.85}
      >
        <Text style={[ss.btnText, { color: c.bg }]}>Ir al inicio de sesión</Text>
      </TouchableOpacity>
    </Dialogo>
  );
}

const ss = StyleSheet.create({
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
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 2,
  },
  hint: {
    width: '100%',
    borderRadius: Radius.sm,
    borderWidth: 0.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    height: 52,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

const STR_LABELS = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente'];

function pwdStrength(pwd: string): number {
  return Math.min(4,
    (pwd.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(pwd) ? 1 : 0) +
    (/[0-9]/.test(pwd) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pwd) ? 1 : 0)
  );
}

export default function RegisterScreen() {
  const c = useTheme();
  const texture = useWebTexture();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [accept, setAccept] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const pwdRef = useRef<TextInput>(null);

  const strength = pwdStrength(pwd);
  const strColor = [c.neg, c.neg, c.warn, c.pos, c.pos][strength];

  async function handleRegister() {
    if (loading) return;
    if (!name || !email || !pwd) { mostrarAviso('Campos requeridos', 'Completa todos los campos.'); return; }
    if (!accept) { mostrarAviso('Términos', 'Debes aceptar los términos para continuar.'); return; }
    if (pwd.length < 8) { mostrarAviso('Contraseña corta', 'Mínimo 8 caracteres.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pwd,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: 'mibalance://',
      },
    });
    setLoading(false);
    if (error) { mostrarAviso('Error al registrarse', error.message); return; }
    setShowSuccess(true);
  }

  const s = styles(c);

  return (
    <SafeAreaView style={[s.safe, texture]}>
      <SuccessModal visible={showSuccess} onClose={() => { setShowSuccess(false); router.replace('/login'); }} />
      <KeyboardAvoidingView behavior={COMPORTAMIENTO_TECLADO} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
<ContenedorPantalla variante="auth" style={{ flex: 0, flexGrow: 1 }}>

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
            Crea tu{' '}
            <Text style={[s.h1, { color: c.accent, fontStyle: 'italic' }]}>balance.</Text>
          </Text>
          <Text style={s.sub}>Empieza a llevar tu dinero en menos de un minuto.</Text>

          {/* Fields */}
          <Field label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" c={c}
            autoFocus={AUTOFOCUS_WEB} returnKeyType="next" blurOnSubmit={false}
            onSubmitEditing={() => emailRef.current?.focus()} />
          <Field label="Correo electrónico" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" placeholder="tu@correo.com" c={c}
            inputRef={emailRef} returnKeyType="next" blurOnSubmit={false}
            onSubmitEditing={() => pwdRef.current?.focus()} />
          <Field label="Contraseña" value={pwd} onChangeText={setPwd}
            secureTextEntry={!showPwd} placeholder="Mínimo 8 caracteres" c={c}
            inputRef={pwdRef} returnKeyType="go" onSubmitEditing={handleRegister}
            right={
              <TouchableOpacity onPress={() => setShowPwd(v => !v)}>
                <Text style={s.toggle}>{showPwd ? 'Ocultar' : 'Mostrar'}</Text>
              </TouchableOpacity>
            }
          />

          {/* Password strength */}
          {pwd.length > 0 && (
            <View style={{ marginTop: -4, marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6 }}>
                {[0, 1, 2, 3].map(i => (
                  <View key={i} style={{
                    flex: 1, height: 3, borderRadius: 100,
                    backgroundColor: i < strength ? strColor : c.surface2,
                  }} />
                ))}
              </View>
              <Text style={{ fontSize: 11, color: c.ink3 }}>
                Seguridad: <Text style={{ color: strColor }}>{STR_LABELS[strength]}</Text>
              </Text>
            </View>
          )}

          {/* Terms */}
          <View style={s.termsRow}>
            <TouchableOpacity onPress={() => setAccept(v => !v)} style={[s.checkbox, { borderColor: accept ? c.accent : c.lineStrong, backgroundColor: accept ? c.accent : 'transparent' }]}>
              {accept && (
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✓</Text>
              )}
            </TouchableOpacity>
            <Text style={s.termsText}>
              Acepto los{' '}
              <Text style={{ color: c.ink, textDecorationLine: 'underline' }}>términos</Text>
              {' '}y la{' '}
              <Text style={{ color: c.ink, textDecorationLine: 'underline' }}>política de privacidad</Text>.
            </Text>
          </View>

          {/* CTA */}
          <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            {loading
              ? <ActivityIndicator color={c.bg} />
              : <Text style={s.btnText}>Crear cuenta</Text>
            }
          </TouchableOpacity>

          <View style={{ flex: 1, minHeight: 32 }} />

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={s.footerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

</ContenedorPantalla>
        </ScrollView>
      </KeyboardAvoidingView>
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
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 22 },
  checkbox: {
    width: 18, height: 18, borderRadius: 5, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  termsText: { flex: 1, fontSize: 12.5, color: c.ink3, lineHeight: 18 },
  btn: {
    height: 52, borderRadius: Radius.pill, backgroundColor: c.ink,
    justifyContent: 'center', alignItems: 'center',
  },
  btnText: { color: c.bg, fontSize: 14, fontWeight: '500', letterSpacing: 0.2 },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 8 },
  footerText: { fontSize: 14, color: c.ink3 },
  footerLink: { fontSize: 14, color: c.ink, fontWeight: '500', textDecorationLine: 'underline' },
});
