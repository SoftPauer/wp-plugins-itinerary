import {
  AlignmentType,
  Document,
  HeadingLevel,
  HeightRule,
  NumberFormat,
  PageBreak,
  Paragraph,
  SectionType,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from "docx";
import { ICosting, ISection, IUnits } from "../api/api";
import { useSectionContext } from "../state/sectionProvider";
import { LooseObject } from "../utils";

export class DocumentCreator {
  public create = (costs: ICosting[], sections: ISection[]) => {
    const groupListKey: LooseObject = this.groupArrayOfObjects(
      costs,
      "listKey"
    );
    const groupSction: LooseObject = this.groupArrayOfObjects(
      costs,
      "section_id"
    );
    const document = new Document({
      sections: [
        {
          properties: {
            type: SectionType.NEXT_COLUMN,
            page: {
              pageNumbers: {
                start: 1,
                formatType: NumberFormat.DECIMAL,
              },
            },
          },
          children: [
            new Paragraph({
              text: "Costings Report",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "Costs Summary",
              heading: HeadingLevel.HEADING_2,
            }),
            this.createSummaryTable(groupSction, sections),
            new Paragraph({
              text: "Costs per booking",
              heading: HeadingLevel.HEADING_2,
            }),
            this.createBreakdownTable(groupListKey, sections),
          ],
        },
      ],
    });

    return document;
  };

  public createSummaryTable = (costs: LooseObject, sections: ISection[]) => {
    const keys = Object.keys(costs).sort();
    let rows: TableRow[] = [];
    let totalCost: number = 0;
    const table = new Table({
      columnWidths: [2500, 5505],
      rows: [
        this.createSummaryHeading(),
        ...keys.map((key: string, index: number) => {
          const obj: ICosting[] = costs[key];
          let typeCost: number = 0;
          obj.map((cost: ICosting) => {
            const costingObj = JSON.parse(cost.costing);
            const unitsObj: IUnits = costingObj.units;
            typeCost += Number(unitsObj.Price);
          });
          totalCost += typeCost;

          const section = sections.find(
            (element) =>
              Number(element.id) === Number(costs[key][0]["section_id"])
          )?.name;

          if (section) {
            rows.push(this.createSummaryRow(section, typeCost));
          }

          return rows[index];
        }),
        this.createTotalCost(totalCost),
      ],
      width: {
        size: 8500,
        type: WidthType.DXA,
      },
    });
    return table;
  };

  public createHeading = () => {
    const headingRow = new TableRow({
      tableHeader: true,
      height: { value: 20, rule: HeightRule.AUTO },

      children: [
        new TableCell({
          children: [new Paragraph("Name")],
        }),
        new TableCell({
          children: [new Paragraph("Type")],
        }),
        new TableCell({
          children: [new Paragraph("Cost")],
        }),
      ],
    });
    return headingRow;
  };

  public createBreakdownTable = (costs: LooseObject, sections: ISection[]) => {
    const keys = Object.keys(costs).sort();
    let rows: TableRow[] = [];
    let totalCost: number = 0;
    const table = new Table({
      columnWidths: [2500, 5505],
      rows: [
        this.createHeading(),
        ...keys.map((key: string, index: number) => {
          const obj: ICosting[] = costs[key];
          let typeCost: number = 0;
          obj.map((cost: ICosting) => {
            const costingObj = JSON.parse(cost.costing);
            const unitsObj: IUnits = costingObj.units;
            typeCost += Number(unitsObj.Price);
          });
          totalCost += typeCost;

          const section = sections.find(
            (element) =>
              Number(element.id) === Number(costs[key][0]["section_id"])
          )?.name;

          if (section) {
            rows.push(this.createRows(key, section, typeCost));
          }

          return rows[index];
        }),
        this.createTotalCost(totalCost),
      ],
      width: {
        size: 8500,
        type: WidthType.DXA,
      },
    });
    return table;
  };

  public createRows = (list: string, section: string, price: number) => {
    const tableRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(list)],
        }),
        new TableCell({
          children: [new Paragraph(section)],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: price.toString(),
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    });
    return tableRow;
  };

  public createSummaryHeading = () => {
    const headingRow = new TableRow({
      tableHeader: true,
      height: { value: 20, rule: HeightRule.AUTO },

      children: [
        new TableCell({
          children: [new Paragraph("Name")],
          columnSpan: 2,
        }),
        new TableCell({
          children: [new Paragraph("Cost")],
        }),
      ],
    });
    return headingRow;
  };

  public createSummaryRow = (section: string, price: number) => {
    const tableRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(section)],
          columnSpan: 2,
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: price.toString(),
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    });
    return tableRow;
  };

  public createTotalCost = (total: number) => {
    const costRow = new TableRow({
      children: [
        new TableCell({
          columnSpan: 3,
          children: [
            new Paragraph({
              text: "Total: " + total.toString(),
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      ],
    });
    return costRow;
  };

  public groupArrayOfObjects(list: ICosting[], key: keyof ICosting) {
    return list.reduce(function (rv: any, x: ICosting) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }
}
