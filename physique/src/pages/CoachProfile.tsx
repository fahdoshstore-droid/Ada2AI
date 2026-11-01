import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCoachPublic } from "../hooks/useMarketplace";
import {
  useMyCoachingState,
  useSendRequest,
  useCancelRequest,
} from "../hooks/useRequests";
import { useAuth } from "../hooks/useAuth";
import { Badge, Button, EmptyState, LoadingState } from "../components/ui";
import { Icon } from "../components/Icon";

export function CoachProfile() {
  const { coachId } = useParams<{ coachId: string }>();
  const { userId, role } = useAuth();

  const { data: coach, isLoading, error } = useCoachPublic(coachId);
  const { data: coaching } = useMyCoachingState();
  const sendRequest = useSendRequest();
  const cancelRequest = useCancelRequest();

  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Is the current athlete already waiting on this coach?
  const pendingToThisCoach =
    coaching?.state === "PENDING_REQUEST" &&
    coaching.request?.coach_id === coachId;

  const name = coach?.display_name?.trim() || "المدرب";

  async function handleSend() {
    setFeedback(null);
    try {
      await sendRequest.mutateAsync({
        coachId: coachId!,
        message: message.trim() || undefined,
      });
      setMessage("");
    } catch {
      setFeedback("تعذر إرسال الطلب حالياً. حاول مرة أخرى.");
    }
  }

  async function handleCancel() {
    if (!coaching?.request?.id) return;
    setFeedback(null);
    try {
      await cancelRequest.mutateAsync(coaching.request.id);
    } catch {
      setFeedback("تعذر إلغاء الطلب حالياً. حاول مرة أخرى.");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ada-navy">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <LoadingState label="جارٍ تحميل الملف…" />
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen bg-ada-navy">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            title="المدرب غير متاح"
            description="هذا الملف غير موجود أو تم إيقافه."
            icon={<Icon name="alert" size={20} />}
            action={
              <Link to="/coaches">
                <Button>عرض المدربين</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ada-navy text-ada-text">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/[0.05] bg-ada-navy/80 px-5 py-4 backdrop-blur-xl sm:px-8">
        <Link
          to="/"
          className="font-display text-xl font-black tracking-tight text-ada-teal"
        >
          Ada2<span className="text-ada-text">Physique</span>
        </Link>
        <Link to="/coaches">
          <Button variant="ghost">← المدربون</Button>
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
        {/* Coach header */}
        <div className="ada-glass rounded-[var(--radius-panel)] p-6 sm:p-8">
          <div className="flex items-start gap-5">
            {coach.avatar_url ? (
              <img
                src={coach.avatar_url}
                alt={name}
                className="h-20 w-20 shrink-0 rounded-3xl object-cover"
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-ada-teal-soft to-ada-ocean font-display text-2xl font-bold text-ada-navy">
                {name.slice(0, 2)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-ada-text">{name}</h1>
                {coach.is_verified ? <Badge tone="teal">موثّق</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-ada-muted">
                {coach.years_experience
                  ? `${coach.years_experience} سنوات خبرة`
                  : "مدرب جديد"}
              </p>
            </div>
          </div>

          {coach.specialties.length ? (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {coach.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white/[0.05] px-3 py-1 text-sm text-ada-text-2"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : null}

          {coach.bio ? (
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ada-text-2">
              {coach.bio}
            </p>
          ) : null}

          {coach.competition_background ? (
            <div className="mt-5">
              <h2 className="text-sm font-semibold text-ada-text">الخبرة التنافسية</h2>
              <p className="mt-1 text-sm text-ada-muted">
                {coach.competition_background}
              </p>
            </div>
          ) : null}
        </div>

        {/* Offers (informational — request is the action, payment not live yet) */}
        {coach.offers.length ? (
          <div className="ada-glass mt-5 rounded-[var(--radius-panel)] p-6">
            <h2 className="text-lg font-semibold text-ada-text">الباقات المتاحة</h2>
            <div className="mt-4 space-y-3">
              {coach.offers.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium text-ada-text">{o.name}</div>
                    {o.description ? (
                      <div className="mt-0.5 text-xs text-ada-muted">{o.description}</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Request / status area */}
        <div className="ada-glass mt-5 rounded-[var(--radius-panel)] p-6 sm:p-8">
          {pendingToThisCoach ? (
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-ada-teal/10">
                <Icon name="trend" size={22} className="text-ada-teal" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-ada-text">
                طلبك قيد المراجعة
              </h2>
              <p className="mt-2 text-sm text-ada-muted">
                أرسلت طلب التدريب إلى <span className="text-ada-text">{name}</span>.
              </p>
              <p className="mt-1 text-sm text-ada-muted">بانتظار موافقة المدرب.</p>
              {feedback ? (
                <p className="mt-3 text-sm text-ada-danger">{feedback}</p>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="ghost" onClick={handleCancel} loading={cancelRequest.isPending}>
                  إلغاء الطلب
                </Button>
              </div>
            </div>
          ) : role === "athlete" ? (
            <div>
              <h2 className="text-xl font-semibold text-ada-text">ابدأ مع هذا المدرب</h2>
              <p className="mt-2 text-sm text-ada-muted">
                أرسل طلبك للمدرب، وبمجرد الموافقة تقدر تبدأ التدريب معه.
              </p>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-ada-text-2">
                  وش هدفك؟ (اختياري)
                </label>
                <textarea
                  className="ada-input min-h-20"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب هدفك التدريبي باختصار…"
                />
              </div>

              {feedback ? (
                <p className="mt-3 text-sm text-ada-danger">{feedback}</p>
              ) : null}

              <Button
                className="mt-5 w-full py-3"
                onClick={handleSend}
                loading={sendRequest.isPending}
              >
                إرسال طلب التدريب
              </Button>
            </div>
          ) : userId ? (
            <div className="text-center">
              <p className="text-sm text-ada-muted">
                هذه الميزة متاحة للمتدربين. سجّل الدخول كمتدرب لإرسال طلب التدريب.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-ada-muted">
                سجّل الدخول كمتدرب لإرسال طلب التدريب.
              </p>
              <Link to="/auth" className="mt-4 inline-block">
                <Button>تسجيل الدخول</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
