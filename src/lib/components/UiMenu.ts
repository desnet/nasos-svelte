export type MenuItem = {
  key: string
  label: string
  icon?: string
  children?: MenuItem[]
  /** Заголовок-разделитель, некликабелен */
  groupOnly?: boolean
  /** Дочерние пункты скрываются/раскрываются по клику */
  collapsible?: boolean
  /** Начальное состояние при collapsible (по умолчанию раскрыт) */
  defaultExpanded?: boolean
  badge?: string | number
}
