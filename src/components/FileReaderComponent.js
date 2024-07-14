import React, { useState } from 'react';

const FileReaderComponent = () => {
  const [testData, setTestData] = useState({
    questions: [
      {
        question: "",
        choices: ["", "", "", ""],
      },
    ],
  });

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileText = await file.text();
    const lines = fileText.split('\n');

    const newQuestions = lines.map((line) => {
      const parts = line.split(';');
      return {
        question: parts[0],
        choices: parts.slice(1, 5),
      };
    });

    setTestData({ questions: newQuestions });
  };

  const handleQuestionChange = (e, index) => {
    const newQuestions = [...testData.questions];
    newQuestions[index].question = e.target.value;
    setTestData({ questions: newQuestions });
  };

  const handleChoiceChange = (e, questionIndex, choiceIndex) => {
    const newQuestions = [...testData.questions];
    newQuestions[questionIndex].choices[choiceIndex] = e.target.value;
    setTestData({ questions: newQuestions });
  };

  const renderQuestions = () => {
    return testData.questions.map((item, index) => (
      <div className='ml-80' key={index}>
        <label>Question {index + 1}:</label>
        <input
          type="text"
          value={item.question}
          onChange={(e) => handleQuestionChange(e, index)}
        />
        {item.choices.map((choice, choiceIndex) => (
          <div key={choiceIndex}>
            <label>Choice {choiceIndex + 1}:</label>
            <input
              type="text"
              value={choice}
              onChange={(e) => handleChoiceChange(e, index, choiceIndex)}
            />
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div>
      <input className='ml-80' type="file" onChange={handleFileChange} />
      {renderQuestions()}
    </div>
  );
};

export default FileReaderComponent;
