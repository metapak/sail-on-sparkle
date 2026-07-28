import { createFileRoute } from "@tanstack/react-router";
import { FeaturePlaceholder } from "@/components/feature-placeholder";

export const Route = createFileRoute("/dashboard/competitors/changes")({
  head: () => ({
    meta: [
      { title: "Rakipler · Değişiklikler — Sonar Dashboard" },
      {
        name: "description",
        content: "Rakiplerin mağaza bilgilerinde ve kreatiflerinde yaptığı son değişiklikler.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <FeaturePlaceholder
      eyebrow="RAKİP ZEKÂSI · DEĞİŞİKLİKLER"
      title="Değişiklikler"
      description="Rakiplerin mağaza bilgilerinde ve kreatiflerinde yaptığı son değişiklikler."
      bullets={[
        "Mağaza metadata değişiklikleri",
        "Kreatif ve ekran görüntüsü güncellemeleri",
        "Yeni sürüm notları",
        "Değişiklik olay çakıştırma",
      ]}
      breadcrumb={[
        { label: "Genel Bakış", to: "/dashboard" },
        { label: "Rakipler", to: "/dashboard/competitors" },
        { label: "Değişiklikler" },
      ]}
      primaryAction={{ label: "Rakipler Özetine Dön", to: "/dashboard/competitors" }}
    />
  ),
});
