export const Step1Title = ({ dogName }: { dogName: string }) => {
  return (
    <h1 className='h1-extrabold mb-4 py-5'>
      {dogName}의 <span className='text-text-accent'>견종</span>을
      <br />
      알려주세요
    </h1>
  );
};

export const Step2Title = ({ dogName }: { dogName: string }) => {
  return (
    <h1 className='h1-extrabold mb-4 py-5'>
      {dogName}의 <span className='text-text-accent'>생일</span>을
      <br />
      알려주세요
    </h1>
  );
};

export const Step3Title = ({ dogName }: { dogName: string }) => {
  return (
    <h1 className='h1-extrabold mb-4 py-5'>
      {dogName}의 <span className='text-text-accent'>성별</span>을
      <br />
      알려주세요
    </h1>
  );
};

export const Step4Title = ({ dogName }: { dogName: string }) => {
  return (
    <h1 className='h1-extrabold mb-4 py-5'>
      {dogName}의 <span className='text-text-accent'>중성화 여부</span>를
      <br />
      알려주세요
    </h1>
  );
};

export const Step5Title = ({ dogName }: { dogName: string }) => {
  return (
    <h1 className='h1-extrabold mb-4 py-5'>
      {dogName}의 <span className='text-text-accent'>몸무게</span>를
      <br />
      알려주세요
    </h1>
  );
};
