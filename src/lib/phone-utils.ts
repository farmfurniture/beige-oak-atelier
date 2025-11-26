export const normalizeIndianPhone = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    // Keep the + but remove any other non-digits (spaces, dashes, parens)
    return "+" + trimmed.replace(/\D/g, "");
  }
  
  // Remove non-digits
  let digits = trimmed.replace(/\D/g, "");
  
  // Remove leading zero if present (common in India for domestic calls)
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  
  return `+91${digits}`;
};
