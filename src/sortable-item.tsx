import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./sortable-item.less";
import { registerActiveFn } from "./api-control";
import { $teams } from "./state";
import clsx from "clsx";
import { formatCostTime } from "./util";
import { useStore } from "@nanostores/react";

export interface SortableItemProps {
  id: number;
}

function RenderTeamContent(props: SortableItemProps) {
  const teams = useStore($teams);
  const item = teams.find((it) => it.id === props.id)!;

  const totalSolved = item.problemList.reduce((prev, it) => {
    if (it.accepted_time > 0) {
      return prev + 1;
    }
    return prev;
  }, 0);

  // 有多少题目提交过但未解决
  const totalPenalty = item.problemList.reduce((prev, it) => {
    if (it.accepted_time > 0) {
      return prev;
    }
    if (it.total) {
      return prev + 1;
    }
    return prev;
  }, 0);

  return (
    <div className="item">
      <div className="col">{item.rank >= 0 ? item.rank : "-"}</div>
      <div className="col">{props.id}</div>
      <div className="col">{totalSolved}</div>
      <div className="col">{totalPenalty}</div>
      {item.problemList.map((it) => {
        const klss = clsx("col", it.accepted_time > 0 && "green", it.accepted_time === 0 && it.failed > 0 && "red");
        return (
          <div className={klss}>
            {it.accepted_time > 0 ? formatCostTime(it.accepted_time) : ""}
            {it.failed > 0 ? `(-${it.failed})` : ""}
          </div>
        );
      })}
    </div>
  );
}

export function SortableItem(props: SortableItemProps) {
  const { active, attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
    // transition: { duration: 1000, easing: "ease" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (listeners) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    registerActiveFn(props.id, listeners.onFakeApiCall);
  }

  return (
    <div
      id={`team-${props.id}`}
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: "#fff",
        position: "relative",
        zIndex: active && active.id === props.id ? 10 : 1,
      }}
      {...attributes}
    >
      <RenderTeamContent id={props.id} />
    </div>
  );
}
