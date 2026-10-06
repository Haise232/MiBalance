import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { USER_NAME_KEY, USER_PHOTO_KEY } from '@/app/bienvenida';
// Helper to safely access AsyncStorage
const getAsyncStorage = () => {
  try {
    return require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.warn('AsyncStorage native module not found');
    return null;
  }
};

import { FadeIn } from '@/componentes/animaciones';
import Dialogo from '@/componentes/Dialogo';
import ModalConfirm from '@/componentes/ModalConfirm';
import { Fonts, Radius, useTheme, useWebTexture } from '@/constantes/tema';
import { useAppTheme } from '@/contextos/TemaContexto';
import { ContenedorPantalla } from '@/componentes/ContenedorPantalla';
import { AUTOFOCUS_WEB, ES_WEB, MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import { useDiseno } from '@/hooks/useDiseno';
import { mostrarAviso } from '@/servicios/avisos';
import { compartirArchivo } from '@/servicios/exportar';
import {
  exportTransactionsToCSV,
  exportFullBackupJSON,
  importFromOldApp
} from '@/servicios/baseDatos';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllReminders
} from '@/servicios/notificaciones';

// ─── Row component ────────────────────────────────────────────────────────────

interface RowProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  meta?: string;
  onPress?: () => void;
  rightEl?: React.ReactNode;
}

function Row({ icon, title, meta, onPress, rightEl }: RowProps) {
  const C = useTheme();

  const inner = (
    <View style={[styles.row, { backgroundColor: C.surface, borderBottomColor: C.line }]}>
      <View style={[styles.rowIcon, { backgroundColor: C.surface2 }]}>
        <MaterialIcons name={icon} size={18} color={C.ink3} />
      </View>
      <Text style={[styles.rowTitle, { color: C.ink }]}>{title}</Text>
      {meta ? (
        <Text style={[styles.rowMeta, { color: C.ink3 }]}>{meta}</Text>
      ) : null}
      {rightEl ?? (
        onPress ? (
          <Text style={[styles.rowChevron, { color: C.ink4 }]}>›</Text>
        ) : null
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const C = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: C.ink4 }]}>{title}</Text>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────

function ImportModal({ visible, onClose, onImport }: { visible: boolean; onClose: () => void; onImport: (json: string) => void }) {
  const C = useTheme();
  const [importJson, setImportJson] = useState('');

  React.useEffect(() => {
    if (visible) setImportJson('');
  }, [visible]);

  return (
    <Dialogo
      visible={visible}
      onClose={onClose}
      estiloFondo={styles.modalOverlay}
      estiloCaja={[styles.modalContent, { backgroundColor: C.surface }]}
      estiloCajaAncho={styles.modalContentWide}
    >
      <Text style={[styles.modalTitle, { color: C.ink, fontFamily: Fonts.serif }]}>
        Importar / Restaurar
      </Text>
      <Text style={[styles.modalSub, { color: C.ink3 }]}>
        Pega aquí el contenido JSON. {'\n'}
        <Text style={{ fontWeight: '700' }}>Tip:</Text> Importa primero el archivo de &quot;Categorías&quot; para que tus movimientos se clasifiquen correctamente.
      </Text>

      <TextInput
        style={[styles.jsonInput, { backgroundColor: C.bg, color: C.ink, borderColor: C.line }]}
        multiline
        placeholder='{"version": "1.0.0", ...}'
        placeholderTextColor={C.ink4}
        value={importJson}
        onChangeText={setImportJson}
        textAlignVertical="top"
        autoFocus={AUTOFOCUS_WEB}
      />

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: C.surface3 }]}
          onPress={onClose}
        >
          <Text style={{ color: C.ink2, fontWeight: '600' }}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: C.ink }]}
          onPress={() => onImport(importJson)}
        >
          <Text style={{ color: C.surface, fontWeight: '600' }}>Importar</Text>
        </TouchableOpacity>
      </View>
    </Dialogo>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function YoScreen() {
  const C = useTheme();
  const texture = useWebTexture();
  const router = useRouter();
  const { isDark, toggle } = useAppTheme();
  const { esAncho: isWide } = useDiseno();

  const [importModalVisible, setImportModalVisible] = useState(false);
  const [clearDataModal, setClearDataModal] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    async function loadSettings() {
      const storage = getAsyncStorage();
      const [val, name, photo] = await Promise.all([
        storage?.getItem('mibalance_reminders_enabled'),
        storage?.getItem(USER_NAME_KEY),
        storage?.getItem(USER_PHOTO_KEY),
      ]);
      setRemindersEnabled(val === 'true');
      if (name) setUserName(name);
      if (photo) setUserPhoto(photo);
    }
    loadSettings();
  }, []);

  const saveUserName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const storage = getAsyncStorage();
    await storage?.setItem(USER_NAME_KEY, trimmed);
    setUserName(trimmed);
    setEditingName(false);
  };

  const pickPhoto = async () => {
    // En web el selector de archivos del navegador no requiere permiso previo.
    if (!ES_WEB) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        mostrarAviso('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const storage = getAsyncStorage();
      await storage?.setItem(USER_PHOTO_KEY, uri);
      setUserPhoto(uri);
    }
  };

  const toggleReminders = async (value: boolean) => {
    const storage = getAsyncStorage();
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        mostrarAviso('Permisos requeridos', 'Por favor, activa las notificaciones en los ajustes de tu móvil.');
        return;
      }
      await scheduleDailyReminder(20, 0);
      setRemindersEnabled(true);
      await storage?.setItem('mibalance_reminders_enabled', 'true');
    } else {
      await cancelAllReminders();
      setRemindersEnabled(false);
      await storage?.setItem('mibalance_reminders_enabled', 'false');
    }
  };

  const handleImport = async (importJson: string) => {
    if (!importJson.trim()) {
      mostrarAviso('Error', 'Por favor, pega el JSON de exportación.');
      return;
    }

    try {
      const data = JSON.parse(importJson.trim());
      const result = await importFromOldApp(data);

      let msg = 'Importación finalizada:\n';
      if (result.categoriesCount > 0) msg += `• ${result.categoriesCount} categorías\n`;
      if (result.transactionsCount > 0) msg += `• ${result.transactionsCount} movimientos\n`;
      if (result.debtsCount > 0) msg += `• ${result.debtsCount} deudas\n`;
      if (result.subsCount > 0) msg += `• ${result.subsCount} suscripciones\n`;

      mostrarAviso('Éxito', msg);
      setImportModalVisible(false);
    } catch (error) {
      mostrarAviso('Error', 'No se pudo procesar el JSON.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = await exportTransactionsToCSV();
      const ok = await compartirArchivo('mibalance_export.csv', csvData, 'text/csv');
      if (!ok) {
        mostrarAviso('No disponible', 'La opción de compartir no está disponible en este dispositivo.');
      }
    } catch (error) {
      mostrarAviso('Error', 'No se pudo generar o compartir el CSV.');
    }
  };

  const handleBackupJSON = async () => {
    try {
      const jsonData = await exportFullBackupJSON();
      const ok = await compartirArchivo('mibalance_backup.json', jsonData, 'application/json');
      if (!ok) {
        mostrarAviso('No disponible', 'La opción de compartir no está disponible en este dispositivo.');
      }
    } catch (error) {
      mostrarAviso('Error', 'No se pudo generar o compartir la copia de seguridad.');
    }
  };

  const handleClearData = () => {
    setClearDataModal(true);
  };

  const confirmClearData = async () => {
    setClearDataModal(false);
    try {
      const { supabase } = require('@/servicios/supabase');
      await Promise.all([
        supabase.from('transacciones').delete().neq('id', 0),
        supabase.from('deudas').delete().neq('id', 0),
        supabase.from('suscripciones').delete().neq('id', 0),
      ]);
    } catch (e) {
      console.error('Error al borrar datos:', e);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.bg }, texture]}>
      <ContenedorPantalla variante="contenido">
      <View style={styles.topBar}>
        <Text style={[styles.topSubtitle, { color: C.ink3 }]}>Configuración</Text>
        <Text style={[styles.topTitle, { color: C.ink, fontFamily: Fonts.serif }]}>
          Ajustes
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL}
        contentContainerStyle={styles.scrollContent}
      >
        <FadeIn>
        <View style={[styles.profileCard, { backgroundColor: C.surface, borderColor: C.line }]}>
          <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
            <View style={[styles.avatar, { backgroundColor: C.accent }]}>
              {userPhoto
                ? <Image source={{ uri: userPhoto }} style={styles.avatarImage} contentFit="cover" />
                : <Text style={[styles.avatarLetter, { color: C.surface }]}>
                    {userName ? userName[0].toUpperCase() : 'M'}
                  </Text>
              }
              <View style={[styles.avatarEditBadge, { backgroundColor: C.ink }]}>
                <MaterialIcons name="photo-camera" size={10} color={C.surface} />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            {editingName ? (
              <View style={styles.nameEditRow}>
                <TextInput
                  style={[styles.nameInput, { color: C.ink, borderColor: C.line, backgroundColor: C.surface2 }]}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  onSubmitEditing={saveUserName}
                  returnKeyType="done"
                  maxLength={30}
                />
                <TouchableOpacity onPress={saveUserName} style={[styles.nameEditSave, { backgroundColor: C.accent }]}>
                  <MaterialIcons name="check" size={16} color={C.surface} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => { setNameInput(userName); setEditingName(true); }} style={styles.nameRow}>
                <Text style={[styles.profileName, { color: C.ink }]}>{userName || 'Mi Balance'}</Text>
                <MaterialIcons name="edit" size={14} color={C.ink4} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
            <Text style={[styles.profileSub, { color: C.ink3 }]}>Cuenta personal</Text>
          </View>
        </View>
        </FadeIn>

        <FadeIn delay={80}>
        <SectionHeader title="PREFERENCIAS" />
        <View style={[styles.cardGroup, { borderColor: C.line }]}>
          <Row
            icon="dark-mode"
            title="Modo oscuro"
            rightEl={
              <Switch
                value={isDark}
                onValueChange={toggle}
                trackColor={{ false: C.surface3, true: C.ink }}
                thumbColor={C.surface}
              />
            }
          />
          {/* expo-notifications no funciona en web: ocultamos los recordatorios */}
          {!ES_WEB && (
            <Row
              icon="notifications"
              title="Recordatorios diarios"
              rightEl={
                <Switch
                  value={remindersEnabled}
                  onValueChange={toggleReminders}
                  trackColor={{ false: C.surface3, true: C.ink }}
                  thumbColor={C.surface}
                />
              }
            />
          )}
          <Row icon="euro" title="Moneda" meta="EUR · €" onPress={() => {}} />
        </View>
        </FadeIn>

        <FadeIn delay={160}>
        <SectionHeader title="CUENTAS" />
        <View style={[styles.cardGroup, { borderColor: C.line }]}>
          <Row
            icon="account-balance-wallet"
            title="Mis cuentas"
            onPress={() => router.push('/cuentas')}
          />
          <Row
            icon="pie-chart"
            title="Categorías y Presupuestos"
            onPress={() => router.push('/categorias')}
          />
        </View>
        </FadeIn>

        <FadeIn delay={240}>
        <SectionHeader title="DATOS" />
        <View style={[styles.cardGroup, { borderColor: C.line }]}>
          <Row
            icon="file-download"
            title="Exportar movimientos (CSV)"
            onPress={handleExportCSV}
          />
          <Row
            icon="file-upload"
            title="Restaurar copia / Importar"
            onPress={() => setImportModalVisible(true)}
          />
          <Row
            icon="delete-forever"
            title="Borrar todos los datos"
            onPress={handleClearData}
          />
        </View>
        </FadeIn>

        <FadeIn delay={320}>
          <SectionHeader title="AYUDA" />
          <View style={[styles.cardGroup, { borderColor: C.line }]}>
            <Row
              icon="school"
              title="Revisar tutorial"
              onPress={async () => {
                const storage = getAsyncStorage();
                await storage?.removeItem('mibalance_tutorial_done');
                router.push('/tutorial');
              }}
            />
          </View>
        </FadeIn>

        <FadeIn delay={400}>
          <TouchableOpacity
            style={[styles.signOutBtn, { borderColor: C.neg }]}
            onPress={async () => {
              const { supabase } = require('@/servicios/supabase');
              await supabase.auth.signOut();
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={18} color={C.neg} />
            <Text style={[styles.signOutText, { color: C.neg }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </FadeIn>

        <View style={isWide ? styles.bottomSpacerWide : styles.bottomSpacer} />
      </ScrollView>
      </ContenedorPantalla>

      <ImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onImport={handleImport}
      />

      <ModalConfirm
        visible={clearDataModal}
        title="Borrar todos los datos"
        message="Se eliminarán todos los movimientos, deudas y suscripciones. Esta acción no se puede deshacer."
        confirmLabel="Borrar todo"
        onConfirm={confirmClearData}
        onCancel={() => setClearDataModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  topSubtitle: { fontSize: 12, fontWeight: '500', letterSpacing: 0.4, marginBottom: 2 },
  topTitle: { fontSize: 24, fontWeight: '400' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: Radius.md, borderWidth: 1, marginBottom: 24 },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  avatarLetter: { fontSize: 22, fontWeight: '700' },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  nameEditRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameInput: { flex: 1, fontSize: 15, fontWeight: '600', borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  nameEditSave: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { gap: 2 },
  profileName: { fontSize: 16, fontWeight: '600' },
  profileSub: { fontSize: 13 },
  sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4, marginBottom: 8, marginLeft: 4 },
  cardGroup: { borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12, borderBottomWidth: 1 },
  rowIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { flex: 1, fontSize: 15, fontWeight: '400' },
  rowMeta: { fontSize: 13 },
  rowChevron: { fontSize: 20, fontWeight: '300' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 8, paddingVertical: 14, borderRadius: Radius.pill, borderWidth: 1 },
  signOutText: { fontSize: 15, fontWeight: '500' },
  bottomSpacer: { height: 120 },
  bottomSpacerWide: { height: 32 },
  modalOverlay: { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: Radius.lg, padding: 24, maxHeight: '80%' },
  modalContentWide: { maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  modalSub: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  jsonInput: { height: 200, borderRadius: Radius.md, borderWidth: 1, padding: 12, fontSize: 12, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, height: 48, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
});
