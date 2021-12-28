import test from 'ava'
import {transform} from '@babel/core'
import plugin from '../'

const compile = (code: string) =>
  transform(code, {
    presets: ['@babel/preset-react'],
    plugins: [plugin],
  })

test.skip('Simple Transform', (t) => {
  const code = `
    import * as React from "react"
    
    function Component(){
        let $a = 1;
    
        const onPress = () => {
            $a += 1;
        }
    
        return <div>
            <p>{$a}</p>
            <button onClick={onPress}>Press</button>
        </div>;
    }
    `

  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  t.snapshot(result.code)
})

test.skip('Check Functional Scope', (t) => {
  const code = `
    import * as React from "react"
    
    let $b = 2;

    function Component(){
        let $a = 1;
    
        const onPress = () => {
            $a += 1;
            $b = 3;
        }
    
        return <div>
            <p>{$a}</p>
            <button onClick={onPress}>Press</button>
        </div>;
    }`

  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  t.snapshot(result.code)
})

test.skip('Check Arrow Function Scope', (t) => {
  const code = `
    import * as React from "react";

    let $b = 2;
    
    const Component = () => {
      let $a = 1;
    
      const onPress = () => {
        $a += 1;
        $b = 3;
      };
    
      return (
        <div>
          <p>{$a}</p>
          <button onClick={onPress}>Press</button>
        </div>
      );
    };
    `

  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  t.snapshot(result.code)
})

test.skip('Multi Component Scope', (t) => {
  const code = `
    import * as React from "react";

    let $b = 2;

    const Component = () => {
    let $a = 1;

    const onPress = () => {
        $a += 1;
        $b = 3;
    };

    return (
        <div>
        <p>{$a}</p>
        <button onClick={onPress}>Press</button>
        </div>
    );
    };

    const ComponentTwo = () => {
    let $a = 3;

    const onPress = () => {
        $a = 5;
        $b = 3;
    };

    return (
        <div>
        <p>{$a}</p>
        <button onClick={onPress}>Press</button>
        </div>
    );
    };
`

  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  t.snapshot(result.code)
})

test.skip('Hook Function and useEffect dep', (t) => {
  const code = `
    import * as React from "react";

    const useCustomHook = () => {
    let $a = 1;


    React.useEffect(()=>{
      console.log("updated");
    },[$a])


    const onPress = () => {
        $a += 1;
    };

    return {
      a:$a,
      onPress
    }
  }
`

  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  t.snapshot(result.code)
})

test.skip('Singular Binary Expressions', (t) => {
  const code = `
  import React from "react";
  
  export default function App() {
    let $count = 1;
  
    const handleClick = () => {
      $count = $count + 1;
      $count = $count * 2;
    };
  
    return (
      <div>
        <h1>{$count}</h1>
        <button onClick={handleClick}>Click</button>
      </div>
    );
  }
  `
  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  t.snapshot(result.code)
})

test.skip('Object Update', (t) => {
  const code = `
  import * as React from "react";
  
  function App() {
    let $user = { name: "reaper" };
    const updateUser = () => {
      const x = {
        ...$user
      };
      x.name = "barelyhuman";
      $user = x;
    };
    return (
      <>
        <p>{$user.name}</p>
        <button onClick={updateUser}>Click Me</button>
      </>
    );
  }
  `

  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  t.snapshot(result.code)
})

test.skip('Array Update', (t) => {
  const code = `
  import * as React from "react";
  
  function App() {
    let $users = [{ name: "reaper" }];

    const updateUser = () => {
      const _nextUsers =$users.slice();
      _nextUsers[0].name = "barelyhuman"
      $user = _nextUsers;
    };

    return (
      <>
      {$users.map(user=>{
        return <p>{user.name}</p>
      })}
      <button onClick={updateUser}>Click Me</button>
      </>
    );
  }
  `

  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  t.snapshot(result.code)
})

test('state passed around functions', (t) => {
  const code = `
function useCustomHook(){
  let $x = {name:"reaper"};
  
  const addAge = () => {
    $x = {
      ...$x(),
      age:18
    }
  }
  return [...$x,addAge];
}

const Component = () => {
  let [x, setX, addAge] = useCustomHook();
  const updateName = () => {
    setX({
      ...x,
      name: "name",
    });
  };
  return (
    <>
      {x.name}
      {x.age}
      <button onClick={updateName}>update</button>
      <button onClick={addAge}>addAge</button>
    </>
  );
};
  `

  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  t.snapshot(result.code)
})

test.skip('Read executed state value', (t) => {
  const code = `
function Component(){
  let $x = 1;
  console.log($x())
  return <></>
}
  `

  const result = compile(code)
  if (!result) {
    return t.fail()
  }
  console.log(result.code)
})
