import type { ReportTreeNode, ReportDefinition, ReportViewDetail, ReportQueryResult } from '@/types/report'

// 报表目录模拟数据
export const mockReportTree: ReportTreeNode[] = [
  {
    text: '业务流程管理',
    glyph: 60178,
    id: '业务流程管理',
    children: [
      {
        text: '系统报表',
        glyph: 60178,
        id: '业务流程管理\\系统报表',
        children: [],
        tabs: [
          {
            text: 'BPM系统利用率',
            xclass: 'YZSoft.report.rpt.Panel',
            config: {
              path: '业务流程管理\\系统报表\\BPM系统利用率'
            }
          }
        ]
      }
    ]
  },
  {
    text: '工段冲突汇总表',
    glyph: 60178,
    id: '工段冲突汇总表',
    children: [],
    tabs: [
      {
        text: '工段冲突汇总表',
        xclass: 'YZSoft.report.rpt.Panel',
        config: {
          path: '工段冲突汇总表\\工段冲突汇总表'
        }
      }
    ]
  }
]

// 报表定义模拟数据
export const mockReportDefinition: ReportDefinition = {
  success: true,
  name: 'BPM系统利用率',
  MonthOffset: 0,
  MonthDay: 1,
  Paging: true,
  PageItems: 5,
  views: [
    { ViewName: 'Grid视图', ViewType: 'Grid' },
    { ViewName: 'MSChart视图', ViewType: 'MSChart' },
    { ViewName: 'Excel视图', ViewType: 'Excel' }
  ],
  queryParams: [
    {
      Name: '@Year',
      DataType: { name: 'Int32', fullName: 'System.Int32' },
      DisplayName: '',
      Description: null,
      ParameterUIBindType: 'Normal',
      DefaultValue: 2025
    },
    {
      Name: '@ProcessName',
      DataType: { name: 'String', fullName: 'System.String' },
      DisplayName: null,
      Description: null,
      ParameterUIBindType: 'Hidden',
      DefaultValue: null
    },
    {
      Name: '@Date1',
      DataType: null,
      DisplayName: null,
      Description: null,
      ParameterUIBindType: 'StartDate',
      DefaultValue: null
    },
    {
      Name: '@Date2',
      DataType: null,
      DisplayName: null,
      Description: null,
      ParameterUIBindType: 'EndDate',
      DefaultValue: null
    }
  ]
}

// 报表视图模拟数据 - 与 prompt 原始数据一致
export const mockReportView: ReportViewDetail = {
  reportName: 'BPM系统利用率',
  columnInfos: [
    { ColumnName: 'Month', DataType: null, DisplayName: '月份', LinkType: 'None', LinkTo: null, ParametersFill: [] },
    { ColumnName: 'Approved', DataType: null, DisplayName: '核准', LinkType: 'None', LinkTo: null, ParametersFill: [] }
  ],
  view: {
    ColumnInfos: [
      { ColumnName: 'Month', Width: '200', Flex: null, Group: false, Align: 'left', Visible: true },
      { ColumnName: 'Approved', Width: null, Flex: '1', Group: false, Align: 'left', Visible: true },
      { ColumnName: 'Rejected', Width: null, Flex: '1', Group: false, Align: 'left', Visible: true },
      { ColumnName: 'Running', Width: null, Flex: '1', Group: false, Align: 'left', Visible: true },
      { ColumnName: 'Aborted', Width: null, Flex: '1', Group: false, Align: 'left', Visible: true },
      { ColumnName: 'Deleted', Width: null, Flex: '1', Group: false, Align: 'left', Visible: true },
      { ColumnName: 'Total', Width: null, Flex: '1', Group: false, Align: 'left', Visible: true }
    ],
    ViewType: 'Grid',
    ViewName: 'Grid视图'
  }
}

// 报表数据模拟 - 与 Prompt 原始数据结构一致（不含 Year 字段）
export const mockReportData: ReportQueryResult = {
  total: 12,
  children: [
    { Month: 1, Approved: 45, Rejected: 3, Running: 12, Aborted: 2, Deleted: 1, Total: 63, AvgMinutes: 120, ROWSTAT: 1 },
    { Month: 2, Approved: 52, Rejected: 5, Running: 8, Aborted: 1, Deleted: 0, Total: 66, AvgMinutes: 95, ROWSTAT: 1 },
    { Month: 3, Approved: 68, Rejected: 4, Running: 15, Aborted: 3, Deleted: 2, Total: 92, AvgMinutes: 110, ROWSTAT: 1 },
    { Month: 4, Approved: 41, Rejected: 2, Running: 10, Aborted: 0, Deleted: 1, Total: 54, AvgMinutes: 88, ROWSTAT: 1 },
    { Month: 5, Approved: 73, Rejected: 6, Running: 18, Aborted: 4, Deleted: 3, Total: 104, AvgMinutes: 135, ROWSTAT: 1 },
    { Month: 6, Approved: 59, Rejected: 3, Running: 14, Aborted: 2, Deleted: 1, Total: 79, AvgMinutes: 102, ROWSTAT: 1 },
    { Month: 7, Approved: 82, Rejected: 7, Running: 20, Aborted: 5, Deleted: 2, Total: 116, AvgMinutes: 145, ROWSTAT: 1 },
    { Month: 8, Approved: 64, Rejected: 4, Running: 11, Aborted: 1, Deleted: 0, Total: 80, AvgMinutes: 98, ROWSTAT: 1 },
    { Month: 9, Approved: 71, Rejected: 5, Running: 16, Aborted: 3, Deleted: 2, Total: 97, AvgMinutes: 118, ROWSTAT: 1 },
    { Month: 10, Approved: 55, Rejected: 2, Running: 9, Aborted: 1, Deleted: 1, Total: 68, AvgMinutes: 85, ROWSTAT: 1 },
    { Month: 11, Approved: 78, Rejected: 6, Running: 22, Aborted: 4, Deleted: 3, Total: 113, AvgMinutes: 142, ROWSTAT: 1 },
    { Month: 12, Approved: 48, Rejected: 3, Running: 7, Aborted: 2, Deleted: 0, Total: 60, AvgMinutes: 92, ROWSTAT: 1 }
  ]
}
