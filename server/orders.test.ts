import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { sendContactEmail } from "./mailer";
import { notifyOwner } from "./_core/notification";


// Mock de les funcions de base de dades
vi.mock("./db", () => ({
  createOrder: vi.fn().mockResolvedValue({ insertId: 1 }),
  getAllOrders: vi.fn().mockResolvedValue([
    {
      id: 1,
      customerName: "Test User",
      customerPhone: "600123456",
      customerEmail: "test@example.com",
      notes: null,
      paymentMethod: "transferencia",
      totalPrice: 36,
      itemsJson: JSON.stringify([{ name: "Samarreta Noi", size: "M", quantity: 2, price: 18 }]),
      isPaid: 0,
      isDelivered: 0,
      adminNotes: null,
      deliveryEmailSent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      pickupPointId: 1,
    },
  ]),
  updateOrderStatus: vi.fn().mockResolvedValue({}),
  deleteOrder: vi.fn().mockResolvedValue({}),
  // Mocks per a altres funcions usades al router
  createReview: vi.fn(),
  getApprovedReviews: vi.fn().mockResolvedValue([]),
  getAllReviews: vi.fn().mockResolvedValue([]),
  updateReviewStatus: vi.fn(),
  deleteReview: vi.fn(),
  getApprovedPickupPoints: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Test Pickup Point",
      address: "Carrer Test 123",
      city: "Barcelona",
      phone: "666666666",
      status: "approved",
    },
  ]),
  getAllPickupPoints: vi.fn().mockResolvedValue([]),
}));


// Mock de l'email i notificació
vi.mock("./mailer", () => ({
  sendOrderEmail: vi.fn().mockResolvedValue(true),
  sendClientConfirmationEmail: vi.fn().mockResolvedValue(true),
  sendDeliveryEmail: vi.fn().mockResolvedValue(true),
  sendPaymentReminderEmail: vi.fn().mockResolvedValue(true),
  sendContactEmail: vi.fn().mockResolvedValue(true),
  sendPaymentConfirmationEmail: vi.fn().mockResolvedValue(true),
  sendOrderReadyEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Funcions auxiliars per crear contextos
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      name: "Admin User",
      email: "admin@example.com",
      loginMethod: "oauth",
      role: "admin",
    },
    req: {
      headers: { origin: "http://localhost:3000" },
    } as any,
    res: {} as any,
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      headers: { origin: "http://localhost:3000" },
    } as any,
    res: {} as any,
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-user",
      name: "Regular User",
      email: "user@example.com",
      loginMethod: "oauth",
      role: "user",
    },
    req: {
      headers: { origin: "http://localhost:3000" },
    } as any,
    res: {} as any,
  };
}

// ──────────────────────────────────────────────────────────────

describe("orders.submit (public)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permet crear una comanda amb dades vàlides", async () => {
    const { createOrder } = await import("./db");
    const { sendOrderEmail } = await import("./mailer");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      name: "Gerard",
      phone: "666123456",
      email: "gerard@example.com",
      notes: "Sense notes",
      paymentMethod: "transferencia" as const,
      pickupPointId: 1,
      items: [{ name: "Samarreta Noi", size: "M", quantity: 2, price: 18 }],
      totalPrice: 36,
    };

    const result = await caller.orders.submit(input);

    expect(result.success).toBe(true);
    expect(createOrder).toHaveBeenCalled();
    expect(sendOrderEmail).toHaveBeenCalled();
  });

  it("NO permet crear una comanda sense email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      name: "Gerard",
      phone: "666123456",
      email: "invalid-email",
      paymentMethod: "transferencia" as const,
      pickupPointId: 1,
      items: [{ name: "Samarreta Noi", size: "M", quantity: 2, price: 18 }],
      totalPrice: 36,
    };

    await expect(caller.orders.submit(input)).rejects.toThrow();
  });

  it("NO permet crear una comanda sense nom", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      name: "",
      phone: "666123456",
      email: "gerard@example.com",
      paymentMethod: "transferencia" as const,
      pickupPointId: 1,
      items: [{ name: "Samarreta Noi", size: "M", quantity: 2, price: 18 }],
      totalPrice: 36,
    };

    await expect(caller.orders.submit(input)).rejects.toThrow();
  });

  it("NO permet crear una comanda sense telèfon", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      name: "Gerard",
      phone: "",
      email: "gerard@example.com",
      paymentMethod: "transferencia" as const,
      pickupPointId: 1,
      items: [{ name: "Samarreta Noi", size: "M", quantity: 2, price: 18 }],
      totalPrice: 36,
    };

    await expect(caller.orders.submit(input)).rejects.toThrow();
  });

  it("NO permet crear una comanda sense productes", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      name: "Gerard",
      phone: "666123456",
      email: "gerard@example.com",
      paymentMethod: "transferencia" as const,
      pickupPointId: 1,
      items: [],
      totalPrice: 0,
    };

    await expect(caller.orders.submit(input)).rejects.toThrow();
  });

  it("NO permet crear una comanda sense pickupPointId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      name: "Gerard",
      phone: "666123456",
      email: "gerard@example.com",
      paymentMethod: "transferencia" as const,
      pickupPointId: 0,
      items: [{ name: "Samarreta Noi", size: "M", quantity: 2, price: 18 }],
      totalPrice: 36,
    };

    await expect(caller.orders.submit(input)).rejects.toThrow();
  });
});

// ──────────────────────────────────────────────────────────────

describe("orders.getMyOrders (protected)", () => {
  it("permet a un usuari autenticat obtenir les seves comandes", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.getMyOrders();

    expect(Array.isArray(result)).toBe(true);
  });

  it("NO permet a un usuari no autenticat obtenir comandes", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.orders.getMyOrders()).rejects.toThrow("Please login");
  });
});

// ──────────────────────────────────────────────────────────────

describe("orders.getOrder (protected)", () => {
  it("permet a un usuari autenticat obtenir una comanda seva", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    // Esperem que falli perquè la comanda del mock no pertany a aquest usuari
    await expect(caller.orders.getOrder({ id: 1 })).rejects.toThrow();
  });

  it("NO permet a un usuari no autenticat obtenir una comanda", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.orders.getOrder({ id: 1 })).rejects.toThrow("Please login");
  });
});

// ──────────────────────────────────────────────────────────────

describe("orders.listAll (admin)", () => {
  it("permet a un admin llistar totes les comandes", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.orders.listAll();

    expect(Array.isArray(result)).toBe(true);
  });

  it("NO permet a un usuari regular llistar totes les comandes", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.orders.listAll()).rejects.toThrow("Accés restringit a administradors");
  });

  it("NO permet a un usuari no autenticat llistar comandes", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.orders.listAll()).rejects.toThrow("Please login");
  });
});

// ──────────────────────────────────────────────────────────────

describe("orders.updateStatus (admin)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permet a un admin marcar una comanda com a pagada", async () => {
    const { updateOrderStatus } = await import("./db");
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.orders.updateStatus({ id: 1, isPaid: 1 });

    expect(updateOrderStatus).toHaveBeenCalledWith(1, { isPaid: 1 });
  });

  it("permet a un admin marcar una comanda com a entregada", async () => {
    const { updateOrderStatus } = await import("./db");
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.orders.updateStatus({ id: 1, isDelivered: 1 });

    expect(updateOrderStatus).toHaveBeenCalled();
  });

  it("NO permet a un usuari regular actualitzar comandes", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.orders.updateStatus({ id: 1, isPaid: 1 })
    ).rejects.toThrow("Accés restringit a administradors");
  });

  it("NO permet a un usuari no autenticat actualitzar comandes", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.orders.updateStatus({ id: 1, isPaid: 1 })
    ).rejects.toThrow("Please login");
  });
});

describe("orders.updateStatus — correu de comanda llista per recollir", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crida sendOrderReadyEmail quan isDelivered passa de 0 a 1", async () => {
    const { sendOrderReadyEmail } = await import("./mailer");
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // La comanda del mock té isDelivered = 0
    await caller.orders.updateStatus({ id: 1, isDelivered: 1 });

    expect(sendOrderReadyEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "Test User",
        customerEmail: "test@example.com",
        pickupPointName: expect.any(String),
      })
    );
  });

  it("NO crida sendOrderReadyEmail si isDelivered ja era 1 (ja entregada)", async () => {
    const { getAllOrders } = await import("./db");
    const { sendOrderReadyEmail } = await import("./mailer");
    vi.mocked(getAllOrders).mockResolvedValueOnce([
      {
        id: 1,
        customerName: "Test User",
        customerPhone: "600123456",
        customerEmail: "test@example.com",
        notes: null,
        paymentMethod: "transferencia" as const,
        totalPrice: 36,
        itemsJson: JSON.stringify([{ name: "Samarreta Noi", size: "M", quantity: 2, price: 18 }]),
        isPaid: 1,
        isDelivered: 1, // ja estava entregada
        adminNotes: null,
        deliveryEmailSent: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        pickupPointId: 1,
      },
    ]);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    vi.mocked(sendOrderReadyEmail).mockClear();

    await caller.orders.updateStatus({ id: 1, isDelivered: 1 });

    expect(sendOrderReadyEmail).not.toHaveBeenCalled();
  });

  it("marca deliveryEmailSent=1 a la BD quan el correu d'entrega s'envia correctament", async () => {
    const { updateOrderStatus } = await import("./db");
    vi.mocked(updateOrderStatus).mockClear();

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.orders.updateStatus({ id: 1, isDelivered: 1 });

    // Ha d'haver-hi dues crides: la primera per actualitzar isDelivered, la segona per deliveryEmailSent
    const calls = vi.mocked(updateOrderStatus).mock.calls;
    const deliveryEmailCall = calls.find(call => call[1]?.deliveryEmailSent === 1);
    expect(deliveryEmailCall).toBeDefined();
  });

  it("NO crida sendOrderReadyEmail si s'actualitza el pagament (no l'entrega)", async () => {
    const { sendOrderReadyEmail } = await import("./mailer");
    vi.mocked(sendOrderReadyEmail).mockClear();

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.orders.updateStatus({ id: 1, isPaid: 1 });

    expect(sendOrderReadyEmail).not.toHaveBeenCalled();
  });
});

describe("orders.updateStatus — correu de confirmació de pagament", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crida sendPaymentConfirmationEmail quan isPaid passa de 0 a 1", async () => {
    const { sendPaymentConfirmationEmail } = await import("./mailer");
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.orders.updateStatus({ id: 1, isPaid: 1 });

    expect(sendPaymentConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "Test User",
        customerEmail: "test@example.com",
        totalPrice: 36,
      })
    );
  });

  it("NO crida sendPaymentConfirmationEmail si isPaid ja era 1 (ja pagada)", async () => {
    const { getAllOrders } = await import("./db");
    const { sendPaymentConfirmationEmail } = await import("./mailer");
    vi.mocked(getAllOrders).mockResolvedValueOnce([
      {
        id: 1,
        customerName: "Test User",
        customerPhone: "600123456",
        customerEmail: "test@example.com",
        notes: null,
        paymentMethod: "transferencia" as const,
        totalPrice: 36,
        itemsJson: JSON.stringify([{ name: "Samarreta Noi", size: "M", quantity: 2, price: 18 }]),
        isPaid: 1, // ja estava pagada
        isDelivered: 0,
        adminNotes: null,
        deliveryEmailSent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        pickupPointId: 1,
      },
    ]);

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    vi.mocked(sendPaymentConfirmationEmail).mockClear();

    await caller.orders.updateStatus({ id: 1, isPaid: 1 });

    expect(sendPaymentConfirmationEmail).not.toHaveBeenCalled();
  });

  it("NO crida sendPaymentConfirmationEmail si s'actualitza l'entrega (no el pagament)", async () => {
    const { sendPaymentConfirmationEmail } = await import("./mailer");
    vi.mocked(sendPaymentConfirmationEmail).mockClear();

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.orders.updateStatus({ id: 1, isDelivered: 1 });

    expect(sendPaymentConfirmationEmail).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────────────────

describe("orders.delete (admin)", () => {
  it("permet a un admin eliminar una comanda", async () => {
    const { deleteOrder } = await import("./db");
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    await caller.orders.delete({ id: 1 });

    expect(deleteOrder).toHaveBeenCalledWith(1);
  });

  it("NO permet a un usuari regular eliminar comandes", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.orders.delete({ id: 1 })).rejects.toThrow("Accés restringit a administradors");
  });

  it("NO permet a un usuari no autenticat eliminar comandes", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.orders.delete({ id: 1 })).rejects.toThrow("Please login");
  });
});

// ──────────────────────────────────────────────────────────────

describe("contact.send (public)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validInput = {
    nom: "Gerard",
    email: "gerard@example.com",
    motiu: "Consulta",
    missatge: "Hola, vull saber més...",
  };

  it("permet enviar un missatge de contacte", async () => {
    const { sendContactEmail } = await import("./mailer");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.contact.send(validInput);

    expect(sendContactEmail).toHaveBeenCalledWith(validInput);
    expect(notifyOwner).toHaveBeenCalled();
  });

  it("llança error si sendContactEmail falla", async () => {
    vi.mocked(sendContactEmail).mockResolvedValueOnce(false);
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.contact.send(validInput)).rejects.toThrow(
      "No s'ha pogut enviar el missatge"
    );
  });

  it("NO permet enviar un missatge sense nom", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.send({ ...validInput, nom: "" })
    ).rejects.toThrow();
  });

  it("NO permet enviar un missatge sense email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.send({ ...validInput, email: "invalid" })
    ).rejects.toThrow();
  });

  it("NO permet enviar un missatge sense motiu", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.send({ ...validInput, motiu: "" })
    ).rejects.toThrow();
  });

  it("NO permet enviar un missatge sense contingut", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.send({ ...validInput, missatge: "" })
    ).rejects.toThrow();
  });
});
