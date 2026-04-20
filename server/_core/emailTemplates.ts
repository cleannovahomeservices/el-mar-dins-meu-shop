/**
 * Email templates for El Mar dins Meu
 */

export function getWelcomeEmailForPickupPoint(entityName: string, contactPerson: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Benvingut a El Mar dins Meu - Punt de recollida`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Nunito', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4a9b8e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #4a9b8e; font-size: 18px; border-bottom: 2px solid #4a9b8e; padding-bottom: 10px; }
          .section p { margin: 10px 0; }
          .checklist { list-style: none; padding: 0; }
          .checklist li { padding: 8px 0; padding-left: 25px; position: relative; }
          .checklist li:before { content: "✓"; position: absolute; left: 0; color: #4a9b8e; font-weight: bold; }
          .cta-button { display: inline-block; background: #4a9b8e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 10px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
          .highlight { background: #fffacd; padding: 15px; border-left: 4px solid #4a9b8e; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌊 Benvingut a El Mar dins Meu</h1>
            <p>Gràcies per ser punt de recollida</p>
          </div>

          <div class="content">
            <p>Hola <strong>${contactPerson}</strong>,</p>

            <p>Gràcies per oferir-te com a punt de recollida per a <strong>${entityName}</strong>! Ets part fonamental del nostre projecte "El Mar dins Meu".</p>

            <div class="section">
              <h2>📋 Què significa ser un punt de recollida?</h2>
              <p>Els punts de recollida permeten que les persones de la teva zona puguin recollir les samarretes "El Mar dins Meu" de forma còmoda i segura. Això facilita l'accés al projecte i crea una xarxa comunitària de suport.</p>
            </div>

            <div class="section">
              <h2>✅ Pròxims passos</h2>
              <ul class="checklist">
                <li>Rebràs les samarretes a l'adreça indicada</li>
                <li>Posa't en contacte amb nosaltres per coordinar la recepció</li>
                <li>Comunica als teus clients que ja pots oferir la recollida</li>
                <li>Notifica'ns quan la recollida estigui completa</li>
              </ul>
            </div>

            <div class="highlight">
              <strong>📞 Contacte:</strong><br>
              Per a qualsevol dubte o coordinació, contacta'ns per WhatsApp o email.<br>
              <strong>Email:</strong> <a href="mailto:info@elmardinsmeu.cat">info@elmardinsmeu.cat</a>
            </div>

            <div class="section">
              <h2>🎯 Materials de difusió</h2>
              <p>T'enviarem:</p>
              <ul class="checklist">
                <li>Cartell per a la teva entrada/web</li>
                <li>Descripció per a xarxes socials</li>
                <li>Informació sobre el projecte</li>
              </ul>
            </div>

            <div class="section">
              <h2>💙 Gràcies!</h2>
              <p>Formar part de la xarxa de punts de recollida significa que creus en el projecte "El Mar dins Meu" i vols ajudar a trencar el silenci. Això és increïble.</p>
              <p>Junts, estem creant un moviment comunitari per a la sensibilització i el suport.</p>
            </div>
          </div>

          <div class="footer">
            <p>El Mar dins Meu | Trencar el silenci és la nostra responsabilitat</p>
            <p><a href="https://elmardinsmeu.cat" style="color: #4a9b8e; text-decoration: none;">elmardinsmeu.cat</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Benvingut a El Mar dins Meu
Gràcies per ser punt de recollida

Hola ${contactPerson},

Gràcies per oferir-te com a punt de recollida per a ${entityName}! Ets part fonamental del nostre projecte "El Mar dins Meu".

QUÈ SIGNIFICA SER UN PUNT DE RECOLLIDA?
Els punts de recollida permeten que les persones de la teva zona puguin recollir les samarretes "El Mar dins Meu" de forma còmoda i segura. Això facilita l'accés al projecte i crea una xarxa comunitària de suport.

PRÒXIMS PASSOS
✓ Rebràs les samarretes a l'adreça indicada
✓ Posa't en contacte amb nosaltres per coordinar la recepció
✓ Comunica als teus clients que ja pots oferir la recollida
✓ Notifica'ns quan la recollida estigui completa

CONTACTE
Per a qualsevol dubte o coordinació, contacta'ns per WhatsApp o email.
Email: info@elmardinsmeu.cat

MATERIALS DE DIFUSIÓ
T'enviarem:
✓ Cartell per a la teva entrada/web
✓ Descripció per a xarxes socials
✓ Informació sobre el projecte

GRÀCIES!
Formar part de la xarxa de punts de recollida significa que creus en el projecte "El Mar dins Meu" i vols ajudar a trencar el silenci. Això és increïble.

Junts, estem creant un moviment comunitari per a la sensibilització i el suport.

---
El Mar dins Meu | Trencar el silenci és la nostra responsabilitat
https://elmardinsmeu.cat
  `;

  return { subject, html, text };
}
