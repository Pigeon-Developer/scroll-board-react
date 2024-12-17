import { useEffect } from "react";
import { DndContext, closestCenter, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useStore } from "@nanostores/react";
import { SortableItem } from "./sortable-item";
import { ApiSensor, mockScoreChange } from "./api-control";
import { $problems, $teams } from "./state";
import { randomColor } from "./util";
import "./sortable-item.less";

const baseA = "A".charCodeAt(0);

const initProblem = new Array(5).fill(0).map((_, index) => {
  return {
    key: `${index}`,
    name: String.fromCharCode(baseA + index),
  };
});

$problems.set(initProblem);

const initList = new Array(80).fill(0).map((_, index) => {
  return {
    id: index,
    bg: randomColor(),
    rank: -1,
    problemList: initProblem.map((it) => {
      return {
        key: it.key,
        total: 0,
        failed: 0,
        accepted_time: 0,
      };
    }),
  };
});

$teams.set(initList);

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;

  const teams = $teams.get();
  if (active.id !== over!.id) {
    const oldIndex = teams.findIndex((it) => it.id === active.id);
    const newIndex = teams.findIndex((it) => it.id === over!.id);

    $teams.set(arrayMove(teams, oldIndex, newIndex));
  }
}

function RenderHeader() {
  const problems = useStore($problems);
  return (
    <div className="header">
      <div className="col">rank</div>
      <div className="col">ID</div>
      <div className="col">解决</div>
      <div className="col">惩罚</div>
      {problems.map((it) => (
        <div className="col">{it.name}</div>
      ))}
    </div>
  );
}

export default function App() {
  const teams = useStore($teams);
  const sensors = useSensors(useSensor(ApiSensor));

  useEffect(() => {
    return mockScoreChange();
  }, []);

  return (
    <div>
      <RenderHeader />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={teams} strategy={verticalListSortingStrategy}>
          {teams.map((team) => (
            <SortableItem key={team.id} id={team.id} item={team} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
