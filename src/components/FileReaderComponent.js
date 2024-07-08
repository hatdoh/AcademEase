import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

const FileReaderComponent = () => {
  const [fileContent, setFileContent] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.name.split('.').pop().toLowerCase();
      let content = '';

      if (fileType === 'pdf') {
        content = await readPdfFile(file);
      } else if (fileType === 'docx') {
        content = await readDocxFile(file);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        content = await readExcelFile(file);
      }

      setFileContent(content);
    }
  };

  const readPdfFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      textContent.items.forEach(item => {
        text += item.str + ' ';
      });
    }

    return text;
  };

  const readDocxFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  };

  const readExcelFile = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    let text = '';

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      text += XLSX.utils.sheet_to_csv(worksheet);
    });

    return text;
  };

  return (
    <div>
      <input type="file" accept=".pdf,.docx,.xlsx,.xls" onChange={handleFileChange} />
      <div>
        <h3>File Content:</h3>
        <pre>{fileContent}</pre>
      </div>
    </div>
  );
};

export default FileReaderComponent;
