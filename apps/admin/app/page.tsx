import { Button } from '@knockdog/ui';

export default function Home() {
  return (
    <div className='flex flex-col gap-4 px-4'>
      <h1>똑독 관리자</h1>

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
