const WA_BASE = "https://wa.me";

export function encodeWaText(text: string): string {
  return encodeURIComponent(text);
}

export function buildAppointmentCreatedWhatsappLink(params: {
  barberPhoneE164: string;
  clientName: string;
  startsAtIso: string;
}): string {
  const digits = params.barberPhoneE164.replace(/\D/g, "");
  const when = new Date(params.startsAtIso).toISOString();
  const message = `Olá! Sou ${params.clientName}. Agendei um horário para ${when}. Podemos confirmar?`;
  return `${WA_BASE}/${digits}?text=${encodeWaText(message)}`;
}

export function buildAppointmentCancelledWhatsappLink(params: {
  barberPhoneE164: string;
  clientName: string;
  startsAtIso: string;
}): string {
  const digits = params.barberPhoneE164.replace(/\D/g, "");
  const when = new Date(params.startsAtIso).toISOString();
  const message = `Olá, sou ${params.clientName}. Preciso cancelar o agendamento de ${when}.`;
  return `${WA_BASE}/${digits}?text=${encodeWaText(message)}`;
}

export function buildReminderWhatsappLink(params: {
  barberPhoneE164: string;
  clientName: string;
  startsAtIso: string;
}): string {
  const digits = params.barberPhoneE164.replace(/\D/g, "");
  const when = new Date(params.startsAtIso).toISOString();
  const message = `Lembrete: tenho corte marcado às ${when}.`;
  return `${WA_BASE}/${digits}?text=${encodeWaText(message)}`;
}
