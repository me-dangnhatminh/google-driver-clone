export const GridView = (props: { items: CardItemProps[] }) => {
  const { items } = props;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <CardItem key={item.id} {...item} />
      ))}
    </div>
  );
};

export type CardItemProps = {
  id: string;
  name: string;
  ownerId?: string;
  size?: number;
  createdAt?: string;
  modifiedAt?: string;
  archivedAt?: string;
  pinnedAt?: string;
};

export const CardItem = (props: CardItemProps) => {
  const { name, size, createdAt, modifiedAt, archivedAt, pinnedAt } = props;
  return (
    <div className="flex items-center space-x-2">
      <span>{name}</span>
    </div>
  );
};
