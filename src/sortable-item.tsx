import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./sortable-item.less";
import { registerActiveFn } from "./api-control";

export interface SortableItemProps {
  id: number;

  item: {
    bg: string;
    score1: number;
    score2: number;
    score3: number;
    score4: number;
  };
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

  const total = props.item.score1 + props.item.score2 + props.item.score3 + props.item.score4;
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
      <div className="col">昵称 {props.id}</div>
      <div className="col">总分 {total}</div>
      <div className="col">得分 1 {props.item.score1}</div>
      <div className="col">得分 2 {props.item.score2}</div>
      <div className="col">得分 3 {props.item.score3}</div>
      <div className="col">得分 4 {props.item.score4}</div>
    </div>
  );
}
