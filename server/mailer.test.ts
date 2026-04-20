/**
 * mailer.test.ts — Verifica que les credencials SMTP estan configurades
 * i que el mòdul de correu s'inicialitza correctament.
 */

import { describe, it, expect, vi } from "vitest";
import nodemailer from "nodemailer";
import { sendPaymentConfirmationEmail } from "./mailer";

describe("SMTP Mailer Configuration", () => {
  it("should have SMTP_USER configured", () => {
    expect(process.env.SMTP_USER).toBeDefined();
    expect(process.env.SMTP_USER).not.toBe("");
  });

  it("should have SMTP_PASS configured", () => {
    expect(process.env.SMTP_PASS).toBeDefined();
    expect(process.env.SMTP_PASS).not.toBe("");
  });

  it("should have ORDER_RECIPIENT_EMAIL configured", () => {
    expect(process.env.ORDER_RECIPIENT_EMAIL).toBeDefined();
    expect(process.env.ORDER_RECIPIENT_EMAIL).toContain("@");
  });

  it("should create a valid nodemailer transporter with Gmail", () => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    expect(transporter).toBeDefined();
  });

  it("should verify SMTP connection to Gmail", async () => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify verifica la connexió sense enviar cap correu
    const result = await transporter.verify();
    expect(result).toBe(true);
  }, 15000); // Timeout de 15 segons per a la connexió SMTP
});

describe("sendPaymentConfirmationEmail", () => {
  const sampleData = {
    customerName: "Anna Test",
    customerEmail: "anna@test.com",
    totalPrice: 36,
    paymentMethod: "transferencia" as const,
    items: [
      { name: "Samarreta Noia", size: "M", quantity: 2, price: 18 },
    ],
  };

  it("should return false if no customerEmail", async () => {
    const result = await sendPaymentConfirmationEmail({
      ...sampleData,
      customerEmail: "",
    });
    expect(result).toBe(false);
  });

  it("should return false if SMTP is not configured", async () => {
    const origUser = process.env.SMTP_USER;
    const origPass = process.env.SMTP_PASS;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const result = await sendPaymentConfirmationEmail(sampleData);
    expect(result).toBe(false);

    process.env.SMTP_USER = origUser;
    process.env.SMTP_PASS = origPass;
  });
});
