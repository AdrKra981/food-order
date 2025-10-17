import { Calendar, Views, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay, set } from "date-fns";
import { enUS, pl } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useEffect, useMemo, useState } from "react";

const locales = {
    en: enUS,
    pl,
};

const localizer = (locale) =>
    dateFnsLocalizer({
        format,
        parse,
        startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
        getDay,
        locales: { [locale]: locales[locale] || enUS },
    });

export default function BigCalendar({
    locale = "en",
    employees = [],
    shifts = [],
    onEventDrop, // ({id, date, start_time, end_time, note})
    onEventResize, // ({id, date, start_time, end_time, note})
    onSelectEvent, // shift
    openingHour = "08:00",
    closingHour = "20:00",
    colorMap,
}) {
    const loc = localizer(locale);
    const DnDCalendar = withDragAndDrop(Calendar);

    const parseDate = (d) => new Date(d + "T00:00:00");

    const mapShiftsToEvents = (inputShifts) =>
        inputShifts.map((s) => {
            const [sh, sm] = (s.start_time || "00:00").split(":").map(Number);
            const [eh, em] = (s.end_time || "00:00").split(":").map(Number);
            const day = s.starts_at?.slice(0, 10) || s.date; // ISO string
            const base = parseDate(day);
            const start = set(base, {
                hours: sh,
                minutes: sm,
                seconds: 0,
                milliseconds: 0,
            });
            const end = set(base, {
                hours: eh,
                minutes: em,
                seconds: 0,
                milliseconds: 0,
            });
            return {
                id: s.id,
                title: `${s.employee_name} (${s.start_time} - ${s.end_time})`,
                start,
                end,
                resource: s,
            };
        });

    // Local events for optimistic updates
    const mappedEvents = useMemo(() => mapShiftsToEvents(shifts), [shifts]);
    const [localEvents, setLocalEvents] = useState(mappedEvents);
    // Sync local events when server data changes
    useEffect(() => {
        setLocalEvents(mappedEvents);
    }, [mappedEvents]);

    // Calendar min/max to respect opening hours
    const [openH, openM] = (openingHour || "08:00").split(":").map(Number);
    const [closeH, closeM] = (closingHour || "20:00").split(":").map(Number);
    const mkTime = (h, m) =>
        set(new Date(), { hours: h, minutes: m, seconds: 0, milliseconds: 0 });
    const min = mkTime(
        isFinite(openH) ? openH : 8,
        isFinite(openM) ? openM : 0
    );
    const max = mkTime(
        isFinite(closeH) ? closeH : 20,
        isFinite(closeM) ? closeM : 0
    );

    // Helpers for drag/resize behavior
    const pad = (n) => String(n).padStart(2, "0");
    const toTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const stepMinutes = 30;
    const clampDragRange = (start, end) => {
        // Keep within the same day and opening/closing hours
        const day = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
            0,
            0,
            0,
            0
        );
        const allowedMin = set(day, {
            hours: isFinite(openH) ? openH : 8,
            minutes: isFinite(openM) ? openM : 0,
            seconds: 0,
            milliseconds: 0,
        });
        const allowedMax = set(day, {
            hours: isFinite(closeH) ? closeH : 20,
            minutes: isFinite(closeM) ? closeM : 0,
            seconds: 0,
            milliseconds: 0,
        });

        let s = new Date(Math.max(start, allowedMin));
        let e = new Date(Math.min(end, allowedMax));

        // Prevent crossing to another day on resize
        if (
            e.getFullYear() !== s.getFullYear() ||
            e.getMonth() !== s.getMonth() ||
            e.getDate() !== s.getDate()
        ) {
            e = new Date(allowedMax);
        }

        // Ensure minimum duration of one step
        const minDurMs = stepMinutes * 60 * 1000;
        if (e - s < minDurMs) {
            e = new Date(s.getTime() + minDurMs);
            if (e > allowedMax) {
                // If we exceed allowedMax, move start up instead
                e = new Date(allowedMax);
                s = new Date(e.getTime() - minDurMs);
                if (s < allowedMin) s = new Date(allowedMin);
            }
        }

        return { start: s, end: e };
    };

    const handleEventDrop = ({ event, start, end }) => {
        const s = event.resource;
        const { start: sClamped, end: eClamped } = clampDragRange(start, end);
        const dateStr = `${start.getFullYear()}-${pad(
            start.getMonth() + 1
        )}-${pad(start.getDate())}`;
        // Optimistically update local events (also fix title times)
        setLocalEvents((prev) =>
            prev.map((ev) =>
                ev.id === event.id
                    ? {
                          ...ev,
                          start: new Date(sClamped),
                          end: new Date(eClamped),
                          title: `${s.employee_name} (${toTime(
                              sClamped
                          )} - ${toTime(eClamped)})`,
                      }
                    : ev
            )
        );
        onEventDrop &&
            onEventDrop({
                id: s.id,
                date: dateStr,
                start_time: toTime(sClamped),
                end_time: toTime(eClamped),
                note: s.note || "",
            });
    };

    const handleEventResize = ({ event, start, end }) => {
        const s = event.resource;
        const { start: sClamped, end: eClamped } = clampDragRange(start, end);
        const dateStr = `${start.getFullYear()}-${pad(
            start.getMonth() + 1
        )}-${pad(start.getDate())}`;
        // Optimistically update local events (also fix title times)
        setLocalEvents((prev) =>
            prev.map((ev) =>
                ev.id === event.id
                    ? {
                          ...ev,
                          start: new Date(sClamped),
                          end: new Date(eClamped),
                          title: `${s.employee_name} (${toTime(
                              sClamped
                          )} - ${toTime(eClamped)})`,
                      }
                    : ev
            )
        );
        onEventResize &&
            onEventResize({
                id: s.id,
                date: dateStr,
                start_time: toTime(sClamped),
                end_time: toTime(eClamped),
                note: s.note || "",
            });
    };

    // Coloring by employee
    const defaultColors = [
        "#EDE9FE",
        "#DBEAFE",
        "#DCFCE7",
        "#FEF9C3",
        "#FFE4E6",
        "#E0E7FF",
        "#FCE7F3",
    ];
    const mapColors =
        colorMap ||
        Object.fromEntries(
            employees.map((e, i) => [
                e.id,
                defaultColors[i % defaultColors.length],
            ])
        );
    const eventPropGetter = (event) => {
        const empId = event?.resource?.user_id;
        const bg = mapColors[empId] || "#F3F4F6";
        return { style: { backgroundColor: bg, borderColor: "#9CA3AF" } };
    };

    return (
        <div className="bg-white rounded shadow">
            <DnDCalendar
                localizer={loc}
                events={localEvents}
                defaultView={Views.WEEK}
                views={[Views.WEEK]}
                startAccessor="start"
                endAccessor="end"
                step={30}
                timeslots={1}
                toolbar={false}
                onEventDrop={handleEventDrop}
                resizable
                onEventResize={handleEventResize}
                onSelectEvent={(event) =>
                    onSelectEvent && onSelectEvent(event.resource)
                }
                draggableAccessor={() => true}
                eventPropGetter={eventPropGetter}
                min={min}
                max={max}
                style={{ height: 600 }}
            />
            {/* Legend */}
            <div className="p-3 text-xs text-gray-600 flex flex-wrap gap-3">
                {employees.map((e) => (
                    <div key={e.id} className="flex items-center gap-2">
                        <span
                            className="inline-block w-3 h-3 rounded"
                            style={{
                                backgroundColor: mapColors[e.id] || "#F3F4F6",
                            }}
                        />
                        <span>{e.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
