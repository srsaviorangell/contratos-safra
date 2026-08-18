import React, { useEffect, useState } from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native"

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"]
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

interface Props {
  visible: boolean
  selected: string
  onSelect: (date: string) => void
  onClose: () => void
}

function buildCells(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)
  return cells
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export default function CalendarModal({ visible, selected, onSelect, onClose }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  useEffect(() => {
    if (!visible) return
    if (selected) {
      const [y, m] = selected.split("-").map(Number)
      setYear(y)
      setMonth(m - 1)
    } else {
      setYear(today.getFullYear())
      setMonth(today.getMonth())
    }
  }, [visible, selected])

  const cells = buildCells(year, month)
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

  function prevMonth() {
    if (month === 0) { setYear(year - 1); setMonth(11) } else { setMonth(month - 1) }
  }

  function nextMonth() {
    if (month === 11) { setYear(year + 1); setMonth(0) } else { setMonth(month + 1) }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{MONTHS[month]} {year}</Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w, i) => (
              <Text key={i} style={styles.weekday}>{w}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((d, i) => (
              d === null ? (
                <View key={`e${i}`} style={styles.day} />
              ) : (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.day,
                    toKey(year, month, d) === selected && styles.daySelected,
                    toKey(year, month, d) === todayKey && !(toKey(year, month, d) === selected) && styles.dayToday,
                  ]}
                  onPress={() => onSelect(toKey(year, month, d))}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayText, toKey(year, month, d) === selected && styles.dayTextSelected]}>{d}</Text>
                </TouchableOpacity>
              )
            ))}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Fechar</Text>
          </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sheet: {
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
    padding: 20,
    width: "100%",
    maxWidth: 380,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(24px)", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" } : {}),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    color: "#E2E8F0",
    fontSize: 22,
    lineHeight: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#F1F5F9",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekday: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  day: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  dayToday: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.4)",
  },
  daySelected: {
    borderRadius: 10,
    backgroundColor: "#10B981",
  },
  dayText: {
    fontSize: 15,
    color: "#E2E8F0",
  },
  dayTextSelected: {
    color: "#06281E",
    fontWeight: "700",
  },
  closeBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
  },
  closeText: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "600",
  },
})