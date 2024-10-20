import { Button, Input } from '@knockdog/ui';

export default function Home() {
  return (
    <div className='flex flex-col gap-4 px-4'>
      <span className='typo-label-14-m text-gray2'>
        처음이신가요? 회원가입하기
      </span>
      <h1 className='typo-title-24-b'>똑독 관리자</h1>
      <Input placeholder='아이디를 입력해주세요.' />
      <div className='flex gap-2'>
        <Button>버튼</Button>
        <Button variant='secondary'>버튼</Button>
        <Button variant='default'>버튼</Button>
      </div>

      <div className='flex gap-2'>
        <Button size='md'>버튼</Button>
        <Button variant='secondary' size='md'>
          버튼
        </Button>
        <Button variant='default' size='md'>
          버튼
        </Button>
      </div>

      <div className='flex gap-2'>
        <Button size='sm'>버튼</Button>
        <Button variant='secondary' size='sm'>
          버튼
        </Button>
        <Button variant='default' size='sm'>
          버튼
        </Button>
      </div>
    </div>
  );
}
