import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./sortable-item.less";
import { registerActiveFn } from "./api-control";
import { Team } from "./state";

export interface SortableItemProps {
  id: number;

  item: Team;
}

export function SortableItem(props: SortableItemProps) {
  const { active, attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
    transition: { duration: 1000, easing: "ease" },
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

  const item = props.item;

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
    <div
      id={`team-${props.id}`}
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: props.item.bg,
        zIndex: active && active.id === props.id ? 10 : 1,
      }}
      {...attributes}
      className="item"
    >
      <div className="col">{item.rank}</div>
      <div className="col">{props.id}</div>
      <div className="col">{totalSolved}</div>
      <div className="col">{totalPenalty}</div>
      {item.problemList.map((it) => (
        <div className="col">{it.accepted_time}</div>
      ))}
    </div>
  );
}
