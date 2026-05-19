import {
  buildAppointmentCancelledWhatsappLink,
  buildAppointmentCreatedWhatsappLink,
  buildReminderWhatsappLink,
} from "../../shared/notifications/whatsapp-links.js";

export class WhatsappLinkService {
  buildCreatedLink(params: {
    barberPhoneE164: string;
    clientName: string;
    startsAtIso: string;
  }): string {
    return buildAppointmentCreatedWhatsappLink(params);
  }

  buildCancelledLink(params: {
    barberPhoneE164: string;
    clientName: string;
    startsAtIso: string;
  }): string {
    return buildAppointmentCancelledWhatsappLink(params);
  }

  buildReminderLink(params: {
    barberPhoneE164: string;
    clientName: string;
    startsAtIso: string;
  }): string {
    return buildReminderWhatsappLink(params);
  }
}
