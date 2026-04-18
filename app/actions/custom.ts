"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/mailer";

export type CustomInquiryState = {
  error: string | null;
  success: string | null;
};

export const customInquiryInitialState: CustomInquiryState = {
  error: null,
  success: null,
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseReferenceImages(raw: string) {
  return raw
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export async function submitCustomInquiry(
  _prevState: CustomInquiryState,
  formData: FormData,
): Promise<CustomInquiryState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const projectType = String(formData.get("projectType") ?? "").trim();
  const material = String(formData.get("material") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim();
  const budget = String(formData.get("budget") ?? "").trim();
  const timeline = String(formData.get("timeline") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const referenceImagesRaw = String(formData.get("referenceImages") ?? "").trim();

  if (!name) {
    return { error: "Please enter your full name.", success: null };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address.", success: null };
  }

  if (!projectType) {
    return { error: "Please select a project type.", success: null };
  }

  if (!details || details.length < 20) {
    return {
      error: "Please provide a bit more detail (at least 20 characters).",
      success: null,
    };
  }

  const referenceImages = parseReferenceImages(referenceImagesRaw);
  const adminEmail = process.env.ADMIN_EMAIL || "info@peradynamics.com";

  await prisma.customInquiry.create({
    data: {
      name,
      email,
      phone: phone || null,
      projectType,
      material: material || null,
      quantity: quantity || null,
      budget: budget || null,
      timeline: timeline || null,
      details,
      referenceImages,
    },
  });

  revalidatePath("/admin/custom");

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Not provided");
  const safeProjectType = escapeHtml(projectType);
  const safeMaterial = escapeHtml(material || "No preference");
  const safeQuantity = escapeHtml(quantity || "Not specified");
  const safeBudget = escapeHtml(budget || "Not specified");
  const safeTimeline = escapeHtml(timeline || "Flexible");
  const safeDetails = escapeHtml(details).replace(/\n/g, "<br />");

  const imagesHtml =
    referenceImages.length === 0
      ? "<p style=\"margin:0;color:#a1a1aa;\">No reference images attached.</p>"
      : `<ul style=\"margin:0;padding-left:18px;\">${referenceImages
          .map(
            (url) =>
              `<li style=\"margin:0 0 6px;\"><a href=\"${escapeHtml(url)}\" style=\"color:#93c5fd;\">${escapeHtml(url)}</a></li>`,
          )
          .join("")}</ul>`;

  const adminHtml = `
  <div style="background:#070b15;padding:28px 14px;font-family:Segoe UI,Arial,sans-serif;color:#f5f5f5;">
    <div style="max-width:640px;margin:0 auto;background:#0f172a;border:1px solid #243042;border-radius:18px;padding:24px;">
      <p style="margin:0;color:#93c5fd;font-size:11px;letter-spacing:.2em;text-transform:uppercase;">Pera Dynamics • Custom Inquiry</p>
      <h1 style="margin:14px 0 10px;font-size:28px;line-height:1.2;font-weight:600;">New Bespoke Project Request</h1>
      <p style="margin:0 0 16px;color:#cbd5e1;font-size:14px;">A new custom project brief has been submitted from peradynamics.com/custom.</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:14px;">
        <tr><td style="padding:8px 0;color:#93c5fd;width:180px;">Client</td><td style="padding:8px 0;color:#f8fafc;">${safeName}</td></tr>
        <tr><td style="padding:8px 0;color:#93c5fd;">Email</td><td style="padding:8px 0;color:#f8fafc;">${safeEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#93c5fd;">Phone</td><td style="padding:8px 0;color:#f8fafc;">${safePhone}</td></tr>
        <tr><td style="padding:8px 0;color:#93c5fd;">Project Type</td><td style="padding:8px 0;color:#f8fafc;">${safeProjectType}</td></tr>
        <tr><td style="padding:8px 0;color:#93c5fd;">Material</td><td style="padding:8px 0;color:#f8fafc;">${safeMaterial}</td></tr>
        <tr><td style="padding:8px 0;color:#93c5fd;">Quantity</td><td style="padding:8px 0;color:#f8fafc;">${safeQuantity}</td></tr>
        <tr><td style="padding:8px 0;color:#93c5fd;">Budget</td><td style="padding:8px 0;color:#f8fafc;">${safeBudget}</td></tr>
        <tr><td style="padding:8px 0;color:#93c5fd;">Timeline</td><td style="padding:8px 0;color:#f8fafc;">${safeTimeline}</td></tr>
      </table>

      <h2 style="margin:10px 0 8px;font-size:15px;color:#93c5fd;">Project Brief</h2>
      <p style="margin:0 0 16px;color:#e2e8f0;font-size:14px;line-height:1.65;">${safeDetails}</p>

      <h2 style="margin:10px 0 8px;font-size:15px;color:#93c5fd;">Reference Images</h2>
      ${imagesHtml}
    </div>
  </div>`;

  const adminText = [
    "New Bespoke Project Request",
    `Client: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Project Type: ${projectType}`,
    `Material: ${material || "No preference"}`,
    `Quantity: ${quantity || "Not specified"}`,
    `Budget: ${budget || "Not specified"}`,
    `Timeline: ${timeline || "Flexible"}`,
    "",
    "Project Brief:",
    details,
    "",
    "Reference Images:",
    referenceImages.length === 0 ? "No reference images attached." : referenceImages.join("\n"),
  ].join("\n");

  const clientHtml = `
  <div style="background:#070b15;padding:28px 14px;font-family:Segoe UI,Arial,sans-serif;color:#f5f5f5;">
    <div style="max-width:620px;margin:0 auto;background:#0f172a;border:1px solid #243042;border-radius:18px;padding:24px;">
      <p style="margin:0;color:#93c5fd;font-size:11px;letter-spacing:.2em;text-transform:uppercase;">Pera Dynamics</p>
      <h1 style="margin:14px 0 10px;font-size:28px;line-height:1.2;font-weight:600;">Your custom brief is in review</h1>
      <p style="margin:0 0 14px;color:#cbd5e1;font-size:14px;line-height:1.65;">Hi ${safeName}, thanks for sharing your bespoke project details. Our team will review your brief and get back to you with next steps and pricing.</p>
      <p style="margin:0;color:#e2e8f0;font-size:14px;line-height:1.65;">If you want to add extra files or notes, just reply to this email.</p>
    </div>
  </div>`;

  const clientText = [
    `Hi ${name},`,
    "",
    "Thanks for sharing your bespoke project details with Pera Dynamics.",
    "Our team will review your brief and get back to you with next steps and pricing.",
    "",
    "If you want to add extra files or notes, just reply to this email.",
  ].join("\n");

  try {
    await sendTransactionalEmail({
      toEmail: adminEmail,
      toName: "Pera Dynamics Admin",
      subject: `Custom Project Inquiry • ${name}`,
      html: adminHtml,
      text: adminText,
      tag: "custom-inquiry",
    });

    await sendTransactionalEmail(
      {
        toEmail: email,
        toName: name,
        subject: "We received your custom project brief • Pera Dynamics",
        html: clientHtml,
        text: clientText,
        tag: "custom-inquiry",
      },
      { throwOnError: false },
    );

    return {
      error: null,
      success: "Thanks, your project brief has been saved and sent. We will contact you shortly.",
    };
  } catch {
    return {
      error: "We could not submit your request right now. Please try again in a moment.",
      success: null,
    };
  }
}
