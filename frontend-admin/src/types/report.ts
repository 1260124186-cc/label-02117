// 报表目录节点
export interface ReportTreeNode {
  text: string
  glyph: number
  id: string
  children: ReportTreeNode[]
  tabs?: ReportTab[]
}

// 报表标签页
export interface ReportTab {
  text: string
  xclass: string
  config: {
    path: string
  }
}

// 报表定义
export interface ReportDefinition {
  success: boolean
  name: string
  MonthOffset: number
  MonthDay: number
  Paging: boolean
  PageItems: number
  views: ReportView[]
  queryParams: QueryParam[]
}

// 报表视图类型
export interface ReportView {
  ViewName: string
  ViewType: 'Grid' | 'MSChart' | 'Excel'
}

// 查询参数
export interface QueryParam {
  Name: string
  DataType: {
    name: string
    fullName: string
  } | null
  DisplayName: string | null
  Description: string | null
  ParameterUIBindType: 'Normal' | 'Hidden' | 'StartDate' | 'EndDate'
  DefaultValue: unknown
}

// 列信息
export interface ColumnInfo {
  ColumnName: string
  DataType: string | null
  DisplayName: string
  LinkType: string
  LinkTo: string | null
  ParametersFill: unknown[]
}

// 视图列配置
export interface ViewColumnInfo {
  ColumnName: string
  Width: string | null
  Flex: string | null
  Group: boolean
  Align: 'left' | 'center' | 'right'
  Visible: boolean
}

// 报表视图详情
export interface ReportViewDetail {
  reportName: string
  columnInfos: ColumnInfo[]
  view: {
    ColumnInfos: ViewColumnInfo[]
    ViewType: string
    ViewName: string
  }
}

// 报表查询结果
export interface ReportQueryResult {
  total: number
  children: Record<string, unknown>[]
}
