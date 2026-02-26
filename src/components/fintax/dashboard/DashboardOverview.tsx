"use client";

import { ArrowRight, CheckCircle2, ChevronRight, Circle, Clock3, FolderCheck, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Stepper } from "@/components/ui";

const chartBars = [35, 45, 52, 61, 58, 70, 85];

export function DashboardOverview() {
  const t = useTranslations("Dashboard.overview");
  const reduceMotion = useReducedMotion();
  const checklistItems = t.raw("checklistItems") as Array<{ label: string; done: boolean }>;
  const caseRows = t.raw("caseRows") as Array<{ label: string; amount: string }>;
  const checklistProgress = Math.round((checklistItems.filter((i) => i.done).length / checklistItems.length) * 100);
  const listContainerVariants = reduceMotion ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
  const listItemVariants = reduceMotion ? undefined : { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  return (
    <section className="space-y-6">
      <motion.div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "show"}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
      >
        <KpiCard title="Open cases" value="3" note="Across tax + benefits" tone="neutral" />
        <KpiCard title="Pending docs" value={`${checklistItems.filter((i) => !i.done).length}`} note="Checklist items missing" tone="copper" />
        <KpiCard title="Estimated refund" value={`EUR ${t("refundAmount")}`} note="Current active case" tone="success" />
        <KpiCard title="Next deadline" value={t("deadlineValue")} note="Tax return submission" tone="neutral" />
      </motion.div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card variant="panel" padding="md" className="xl:col-span-2">
          <CardHeader className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="copper">Active case</Badge>
                <Badge variant="success">{t("statusValue")}</Badge>
              </div>
              <CardTitle className="text-2xl">{t("caseTitle")}</CardTitle>
              <CardDescription>{t("statusLabel")}: {t("statusValue")} | {t("deadlineLabel")}: {t("deadlineValue")}</CardDescription>
            </div>
            <Link href="/tax-return" className="inline-flex items-center gap-1 text-sm font-medium text-copper hover:text-text">
              {t("openCase")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>

          <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-3 sm:grid-cols-2">
              {caseRows.map((row) => (
                <div key={row.label} className="editorial-frame rounded-[var(--radius-lg)] bg-surface2/35 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">{row.label}</p>
                  <p className="mt-2 font-heading text-2xl tracking-[-0.02em] text-text">{row.amount}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-[var(--radius-lg)] border border-border/35 bg-surface2/25 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-text">Progress timeline</p>
                  <span className="text-xs text-muted">{checklistProgress}% complete</span>
                </div>
                <Stepper
                  steps={[
                    { id: "1", label: "Intake complete", description: "Service selected and quote confirmed" },
                    { id: "2", label: "Documents", description: "Checklist upload in progress" },
                    { id: "3", label: "Review", description: "Human review and clarifications" },
                    { id: "4", label: "Submission", description: "Final filing and confirmation" },
                  ]}
                  currentStep={2}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[var(--radius-lg)] border border-border/35 bg-surface2/25 p-4">
                <div className="mb-2 flex items-center gap-2 text-text">
                  <Clock3 className="h-4 w-4 text-copper" />
                  <p className="text-sm font-medium">Timeline / updates</p>
                </div>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="rounded-lg border border-border/25 bg-white/5 px-3 py-2">Case created and intake saved</li>
                  <li className="rounded-lg border border-border/25 bg-white/5 px-3 py-2">Payment confirmed for selected service</li>
                  <li className="rounded-lg border border-border/25 bg-white/5 px-3 py-2">Document review pending uploads</li>
                </ul>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-copper/25 bg-copper/8 p-4">
                <div className="mb-2 flex items-center gap-2 text-text">
                  <Sparkles className="h-4 w-4 text-copper" />
                  <p className="text-sm font-medium">Next action CTA</p>
                </div>
                <p className="text-sm leading-6 text-secondary">Upload missing documents to move your case to human review and avoid deadline delays.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/tax-return" className="inline-flex items-center gap-2 rounded-full border border-green/35 bg-green/90 px-4 py-2 text-sm font-medium text-[#07130e]">
                    Continue tax return
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/benefits" className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-surface/60 px-4 py-2 text-sm font-medium text-text">
                    {t("reviewBenefits")}
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card variant="panel" padding="md">
            <CardHeader className="mb-4">
              <CardTitle className="text-xl">{t("checklistTitle")}</CardTitle>
              <CardDescription>Documents checklist card</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-green to-copper" style={{ width: `${checklistProgress}%` }} />
              </div>
              <p className="mt-2 text-right text-sm font-semibold text-text">{checklistProgress}%</p>
              <motion.ul
                className="mt-4 space-y-2"
                initial={reduceMotion ? false : "hidden"}
                animate={reduceMotion ? undefined : "show"}
                variants={listContainerVariants}
              >
                {checklistItems.map((item) => (
                  <motion.li key={item.label} variants={listItemVariants} className="flex items-center gap-3 rounded-xl border border-border/30 bg-surface2/25 px-3 py-2.5">
                    {item.done ? <CheckCircle2 className="h-4 w-4 text-green" /> : <Circle className="h-4 w-4 text-muted" />}
                    <span className={cn("text-sm", item.done ? "text-text" : "text-secondary")}>{item.label}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <Link href="/tax-return" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-copper hover:text-text">
                {t("progressLabel")}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>

          <Card variant="soft" padding="md" className="bg-surface2/35">
            <CardHeader className="mb-3">
              <CardTitle className="text-xl">{t("refundTitle")}</CardTitle>
              <CardDescription>{t("chartTitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 font-heading text-4xl tracking-[-0.03em] text-green">EUR {t("refundAmount")}</p>
              <div className="rounded-xl border border-border/30 bg-surface/35 p-4">
                <div className="flex h-24 gap-1.5">
                  {chartBars.map((bar, index) => (
                    <div key={`bar-${index}`} className="flex flex-1 items-end">
                      <div
                        className={cn("w-full rounded-t-sm", index === chartBars.length - 1 ? "bg-copper" : "bg-white/15")}
                        style={{ height: `${bar}%` }}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">{t("chartNote")}</p>
              </div>
              <div className="mt-4 grid gap-2">
                {caseRows.map((row) => (
                  <div key={`refund-${row.label}`} className="flex items-center justify-between rounded-lg border border-border/25 bg-white/5 px-3 py-2 text-sm">
                    <span className="text-secondary">{row.label}</span>
                    <span className="text-text">{row.amount}</span>
                  </div>
                ))}
              </div>
              <Link href="/benefits" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-green/35 bg-green/90 px-4 py-2.5 text-sm font-semibold text-[#07130e]">
                <FolderCheck className="h-4 w-4" />
                {t("cta")}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function KpiCard({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  tone: "neutral" | "success" | "copper";
}) {
  const toneClass = tone === "success" ? "border-green/25 bg-green/7" : tone === "copper" ? "border-copper/25 bg-copper/7" : "border-border/35 bg-surface/35";
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}>
      <Card variant="soft" padding="sm" className={toneClass}>
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{title}</p>
        <p className="mt-2 font-heading text-2xl tracking-[-0.03em] text-text">{value}</p>
        <p className="mt-1 text-xs text-secondary">{note}</p>
      </Card>
    </motion.div>
  );
}

