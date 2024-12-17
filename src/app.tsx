import { useEffect } from "react";
import { DndContext, closestCenter, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useStore } from "@nanostores/react";
import { SortableItem } from "./sortable-item";
import { ApiSensor } from "./api-control";
import { $problems, $teams } from "./state";
import { mockScoreChange, prepareMockData } from "./mock";
import "./header.less";

prepareMockData();

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

function RenderContent() {
  const sensors = useSensors(useSensor(ApiSensor));
  const teams = useStore($teams);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={teams} strategy={verticalListSortingStrategy}>
        {teams.map((team) => (
          <SortableItem key={team.id} id={team.id} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

export default function App() {
  useEffect(() => {
    return mockScoreChange();
  }, []);

  return (
    <div>
      <RenderHeader />
      <RenderContent />
    </div>
  );
}
