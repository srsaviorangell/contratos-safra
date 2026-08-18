import React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native"

interface Props {
  visible: boolean
  title: string
  options: string[]
  selected: string
  extraLabel?: string
  extraValue?: string
  onSelect: (value: string) => void
  onClose: () => void
}

export default function OptionModal({ visible, title, options, selected, extraLabel, extraValue, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.list}>
            {options.map((o) => (
              <TouchableOpacity key={o} style={[styles.item, selected === o && styles.itemSelected]} onPress={() => onSelect(o)} activeOpacity={0.7}>
                <Text style={[styles.itemText, selected === o && styles.itemTextSelected]}>{o}</Text>
                {selected === o && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
            {extraLabel && (
              <TouchableOpacity style={[styles.item, styles.extraItem]} onPress={() => onSelect(extraValue ?? "")} activeOpacity={0.7}>
                <Text style={styles.extraText}>＋ {extraLabel}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Platform.OS === "web" ? "rgba(2, 6, 23, 0.72)" : "rgba(2, 6, 23, 0.85)",
    ...(Platform.OS === "web" ? { backdropFilter: "blur(12px)" } : {}),
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(24px)", maxWidth: 480, width: "100%", alignSelf: "center", borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 24 } : {}),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148, 163, 184, 0.4)",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F1F5F9",
    marginBottom: 14,
  },
  list: {
    maxHeight: 340,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  itemSelected: {
    backgroundColor: "rgba(16, 185, 129, 0.16)",
    borderColor: "rgba(16, 185, 129, 0.55)",
  },
  itemText: {
    fontSize: 16,
    color: "#E2E8F0",
  },
  itemTextSelected: {
    color: "#34D399",
    fontWeight: "600",
  },
  check: {
    color: "#34D399",
    fontSize: 16,
    fontWeight: "700",
  },
  extraItem: {
    borderColor: "rgba(16, 185, 129, 0.35)",
    borderStyle: "dashed",
  },
  extraText: {
    fontSize: 16,
    color: "#34D399",
  },
})