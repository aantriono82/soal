import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun } from "docx";

export async function buildPackagePdf(title: string, lines: string[]) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText(title, {
    x: 40,
    y: 790,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1)
  });

  let y = 760;
  for (const line of lines) {
    page.drawText(line, { x: 40, y, size: 11, font });
    y -= 18;
    if (y < 40) {
      y = 760;
    }
  }

  return pdf.save();
}

export async function buildPackageDocx(title: string, lines: string[]) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 32 })]
          }),
          ...lines.map((line) => new Paragraph(line))
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}
