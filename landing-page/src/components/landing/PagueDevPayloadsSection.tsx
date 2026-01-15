import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PagueDevPayloadsSection = () => {
  const { t } = useTranslation();
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const payloads = {
    payment_completed: {
      titleKey: "paguedev.payloads.paymentCompleted.title",
      data: {
        event: "payment_completed",
        eventId: "a0b78f10-c7f4-4f5d-98dd-3e36eafeb812",
        timestamp: "2026-01-11T19:03:28.280Z",
        data: {
          transactionId: "a0b78f10-c7f4-4f5d-98dd-3e36eafeb812",
          environment: "sandbox",
          amount: 100.21,
          feeAmount: 0.5,
          netAmount: 99.71,
          currency: "BRL",
          paymentMethod: "pix",
          status: "completed",
          completedAt: "2026-01-11T19:03:28.277Z",
          externalReference: "pedido-12345",
        },
      },
    },
    refund_completed: {
      titleKey: "paguedev.payloads.refundCompleted.title",
      data: {
        event: "refund_completed",
        eventId: "c92d45e6-8b33-4f12-a789-2e56f8901def",
        timestamp: "2026-01-11T19:22:15.456Z",
        data: {
          refundTransactionId: "c92d45e6-8b33-4f12-a789-2e56f8901def",
          originalTransactionId: "a0b78f10-c7f4-4f5d-98dd-3e36eafeb812",
          environment: "sandbox",
          amount: 50.0,
          feeAmount: 0.25,
          netAmount: 49.75,
          currency: "BRL",
          status: "completed",
          completedAt: "2026-01-11T19:22:15.400Z",
        },
      },
    },
    withdrawal_completed: {
      titleKey: "paguedev.payloads.withdrawalCompleted.title",
      data: {
        event: "withdrawal_completed",
        eventId: "e73775b5-70ee-4bad-be4c-4acff9890e27",
        timestamp: "2026-01-11T19:08:21.953Z",
        data: {
          withdrawalId: "e73775b5-70ee-4bad-be4c-4acff9890e27",
          environment: "sandbox",
          amount: 500.0,
          feeAmount: 2.5,
          netAmount: 497.5,
          currency: "BRL",
          status: "completed",
          completedAt: "2026-01-11T19:08:21.939Z",
        },
      },
    },
    withdrawal_failed: {
      titleKey: "paguedev.payloads.withdrawalFailed.title",
      data: {
        event: "withdrawal_failed",
        eventId: "b84f12c3-9a21-4e67-bc88-1d45f6789abc",
        timestamp: "2026-01-11T19:15:42.123Z",
        data: {
          withdrawalId: "b84f12c3-9a21-4e67-bc88-1d45f6789abc",
          environment: "sandbox",
          amount: 1000.0,
          feeAmount: 5.0,
          netAmount: 995.0,
          currency: "BRL",
          status: "failed",
          failedAt: "2026-01-11T19:15:42.100Z",
          failureReason: "insufficient_funds",
        },
      },
    },
  };

  const handleCopy = async (eventName: string, payload: string) => {
    await navigator.clipboard.writeText(payload);
    setCopiedTab(eventName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <section id="paguedev-payloads" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm mb-4">{t("paguedev.payloads.sectionLabel")}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("paguedev.payloads.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("paguedev.payloads.subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="payment_completed" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              {Object.entries(payloads).map(([key, payload]) => (
                <TabsTrigger key={key} value={key} className="text-xs md:text-sm">
                  {t(payload.titleKey)}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(payloads).map(([key, payload]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="relative">
                  <div className="code-block">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="text-xs text-muted-foreground font-mono">
                        {key}.json
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(key, JSON.stringify(payload.data, null, 2))}
                        className="h-8"
                      >
                        {copiedTab === key ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            {t("paguedev.payloads.copied")}
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            {t("paguedev.payloads.copy")}
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="p-6 overflow-x-auto">
                      <pre className="text-xs md:text-sm">
                        <code>{JSON.stringify(payload.data, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default PagueDevPayloadsSection;
