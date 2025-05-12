import WhatsApp from "whatsapp";

// Your test sender phone number
const wa = new WhatsApp(Number(process.env.WA_PHONE_NUMBER_ID));

// Enter the recipient phone number
const recipient_number = 5519981063537;

export async function send_message() {
  try {
    const sent_text_message = wa.messages.text(
      { body: "Hello world por aqui" },
      recipient_number
    );

    await sent_text_message.then((res) => {
      console.log(res.rawResponse());
    });
    console.log("Message sent successfully");
  } catch (e) {
    console.log(JSON.stringify(e));
  }
}
