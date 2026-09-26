/**
 * Draft legal-policy content. Every page here is placeholder text
 * pending review by a qualified Indian legal/compliance professional —
 * see needsLegalReview on the ContentPage model. Do not present these
 * as final, reviewed policies to customers or regulators.
 */
export const legalPageSeeds = [
  {
    slug: "shipping",
    title: "Shipping Policy",
    bodyMarkdown:
      "CLKAi's shipping areas, timelines and charges will be confirmed here once finalised. Store pickup is available at stores that offer it — see the Store Locator for details.",
  },
  {
    slug: "returns",
    title: "Return and Refund Policy",
    bodyMarkdown:
      "Return and refund eligibility depends on the product and condition (new vs. refurbished) and will be confirmed here once CLKAi finalises the policy. Contact the store you purchased from, or use the Contact page, to raise a return or refund request.",
  },
  {
    slug: "cancellation",
    title: "Cancellation Policy",
    bodyMarkdown:
      "Order cancellation terms will be confirmed here once finalised. To cancel an order, contact CLKAi via the Contact page with your order number.",
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    bodyMarkdown:
      "CLKAi collects only the information needed to fulfil orders, repair bookings and enquiries. Details on what is collected, how it is used and retained, and how to request access, correction or deletion of your data will be published here once finalised and reviewed. For privacy-related requests, use the Contact page.",
  },
  {
    slug: "terms",
    title: "Terms of Use",
    bodyMarkdown:
      "CLKAi's terms of use for this website will be published here once finalised.",
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    bodyMarkdown:
      "This site uses only cookies necessary for core functionality (such as keeping your cart) unless you are shown and accept an option for functional, analytics or marketing cookies. A full breakdown by category will be published here once finalised.",
  },
  {
    slug: "warranty",
    title: "Warranty Information",
    bodyMarkdown:
      "Manufacturer warranty terms vary by product and brand and are shown on each product's page where available. CLKAi does not offer warranty terms beyond what the manufacturer or store confirms.",
  },
  {
    slug: "repair-terms",
    title: "Repair Service Terms",
    bodyMarkdown:
      "Please back up your data before handing over a device for repair — CLKAi is not responsible for data loss during diagnosis or repair, and data recovery (where requested) is attempted on a best-effort basis only and cannot be guaranteed. Diagnostic fees, spare-part availability and turnaround time vary by device and issue and are confirmed by the store after inspection. Repair warranty terms will be confirmed by the store after device diagnosis.",
  },
] as const;
