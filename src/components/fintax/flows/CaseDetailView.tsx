"use client";

import { Activity, CheckCircle2, FileUp, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { getMockCase, mockChecklistByCase, mockDocumentsByCase } from "@/lib/mock-data";
import type { Document } from "@/types/database";

type TabKey = "overview" | "documents" | "authorization" | "activity";

export function CaseDetailView({ caseId }: { caseId: string }) {
  const t = useTranslations("CaseDetail");
  const caseItem = getMockCase(caseId);
  const [tab, setTab] = React.useState<TabKey>("overview");
  const [machtigingCode, setMachtigingCode] = React.useState("");
  const [docs, setDocs] = React.useState<Document[]>(mockDocumentsByCase[caseId] ?? []);

  if (!caseItem) {
    return (
      <Card>
        <CardBody className="text-sm text-white/70">{t("notFound")}</CardBody>
      </Card>
    );
  }

  const checklist = mockChecklistByCase[caseId] ?? [];
  const tabs: TabKey[] = ["overview", "documents", "authorization", "activity"];

  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const nextDocs = Array.from(files)
      .filter((file) => file.size <= 10 * 1024 * 1024)
      .filter((file) => ["application/pdf", "image/jpeg", "image/png"].includes(file.type))
      .map<Document>((file, index) => ({
        id: `local-${Date.now()}-${index}`,
        case_id: caseId,
        user_id: caseItem.user_id,
        checklist_item_id: null,
        file_name: file.name,
        file_path: `local/${file.name}`,
        file_size: file.size,
        mime_type: file.type,
        status: "uploaded",
        review_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
      }));
    setDocs((prev) => [...nextDocs, ...prev]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{caseItem.display_name ?? caseItem.id}</h2>
            <p className="mt-1 text-sm text-white/60">
              {t("status")}: {caseItem.status} � {t("deadline")}: {caseItem.deadline ?? "-"}
            </p>
          </div>
          <div className="rounded-full bg-green/15 px-3 py-1 text-xs font-medium text-green">
            {caseItem.case_type}
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tabKey) => (
          <button
            type="button"
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`rounded-xl border px-3 py-2 text-sm ${tab === tabKey ? "border-green/40 bg-green/10 text-white" : "border-white/10 bg-white/5 text-white/60"}`}
          >
            {t(`tabs.${tabKey}`)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <Card>
          <CardBody className="grid gap-4 lg:grid-cols-3">
            <InfoTile label={t("overview.estimatedRefund")} value={caseItem.estimated_refund ? `EUR ${caseItem.estimated_refund}` : "-"} />
            <InfoTile label={t("overview.machtigingStatus")} value={caseItem.machtiging_status} />
            <InfoTile label={t("overview.progress")} value={`${checklist.filter((x) => x.is_completed).length}/${checklist.length}`} />
            <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-sm font-medium text-white">{t("overview.timeline")}</p>
              <ul className="space-y-2 text-sm text-white/70">
                <li>{t("overview.timelineItems.intake")}</li>
                <li>{t("overview.timelineItems.review")}</li>
                <li>{t("overview.timelineItems.submission")}</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === "documents" && (
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-white">{t("documents.title")}</h3>
            <p className="text-sm text-white/60">{t("documents.supported")}</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <label className="block rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/70">
              <FileUp className="mx-auto mb-2 size-5 text-teal" />
              {t("documents.uploadCta")}
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => onFilesSelected(event.target.files)}
              />
            </label>
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li key={doc.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-white">{doc.file_name}</span>
                    <span className="text-xs text-white/60">{doc.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/50">
                    {doc.mime_type ?? "unknown"} ? {(((doc.file_size ?? 0) / 1024)).toFixed(0)} KB
                  </p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {tab === "authorization" && (
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="size-4 text-green" />
              <h3 className="text-base font-semibold">{t("authorization.title")}</h3>
            </div>
            <p className="text-sm text-white/70">{t("authorization.copy")}</p>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={machtigingCode}
                onChange={(event) => setMachtigingCode(event.target.value)}
                placeholder={t("authorization.placeholder")}
                className="h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-green/40"
              />
              <Button type="button">{t("authorization.submit")}</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {tab === "activity" && (
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center gap-2 text-white">
              <Activity className="size-4 text-teal" />
              <h3 className="text-base font-semibold">{t("activity.title")}</h3>
            </div>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="rounded-xl border border-white/10 bg-white/5 p-3">{t("activity.items.created")}</li>
              <li className="rounded-xl border border-white/10 bg-white/5 p-3">{t("activity.items.payment")}</li>
              <li className="rounded-xl border border-white/10 bg-white/5 p-3">{t("activity.items.review")}</li>
              <li className="rounded-xl border border-white/10 bg-white/5 p-3">{t("activity.items.pending")}</li>
            </ul>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-white">{t("checklist.title")}</h3>
        </CardHeader>
        <CardBody>
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                {item.is_completed ? (
                  <CheckCircle2 className="size-4 text-green" />
                ) : (
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/30" />
                )}
                <span className="text-white/80">{item.label}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
