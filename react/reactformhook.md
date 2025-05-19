# React Form hook

**useForm**:
- **mode**:`onChange | onBlur | onSubmit | onTouched | all = 'onSubmit'`
     1. **onTouched**: Validation is triggered on `blue` event initially,then `change` triggers the validation.
     2. **all**: Validation is triggered on both `blur` and `change` events.
- **reValidationMode**: `onChange | onBlur | onSubmit = 'onChange'`
     -  If the validation is not valid,this option decide the strategy how the trigger should be used. 
- **defaultValues**: `FieldValues | Promise<FieldValues>`
     - Also can be function which returns the default values.!
     - `undefined` should not be used as default value since It will make the components uncontrolled.
- **shouldFocusError**:`boolean=true` First failed input is focused when it's value is `true`.
- **shouldUseNativeValidation**:`boolean=false` 
     - It will set :valid and :invalid css properties to style inputs easier.Also Validation errors will be showed by browser as default.
- **resolver**: 
     - This option takes a validation schema created by resolvers such as `zod` or `yup`.
     - Also `@hookform/resolvers` should be installed to integrate validation libraries with react form hook.
     - A resolver cannot be used with the built-in validators.(required,min...)
- **disabled**: It disable all the input files and prevent to change formState.
- useForm returns below members
     - **register**:
         - name is required and should be unique(except radio and checkbox).
         - Dot(.) notation is used to access array nodes. 
         - **valueAsNumber**: Transforms value to number.If it's not valid number,then NaN will be received.
         - **onChange** ,**onBlur**: event listeners.
         - Register function returns below members:
              - `onChange` ,`onBlur` listeners
              - `ref` : Element reference
              - `name`: provided field name.
              - For example below usages are the same
              - ```ts 
                   // method 1
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Age
                        </label>
                        <input id="age" type="number" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" {...register('age')} />
                        {errors.password && <p className="text-red-500 text-xs italic">{String(errors.password.message)}</p>}
                    </div>

                    // method 2
                    <PasswordInput errors={errors} {...register('password')} /> // usage

                    function PasswordInput({ onChange, onBlur, ref, name, errors }: UseFormRegisterReturn<'password'> & { errors: FieldErrors<LoginFormData> }) {
                        return (
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                    Password
                                </label>
                                <input id="password" type="password" onChange={onChange} onBlur={onBlur} name={name} ref={ref} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                {errors.password && <p className="text-red-500 text-xs italic">{String(errors.password.message)}</p>}
                            </div>
                        );
                    }              
                ```

     - **formState**: includes information about the entire form
         - **isDirty**: Set to true after the user modifies any of the inputs..Make sure to provide defaultValues at the useForm, so hook form can have a single source of truth to compare each field's dirtiness.
         - **dirtyFields**: Changed fields.
         - **isValid**: `true` if the form doesn't have any errors.
         - **errors**: an object with field errors.
         - Read the formState before render to subscribe the form state through the Proxy
         - !! formState is updated in batch. If you want to subscribe to formState via useEffect, make sure that you place the entire formState in the optional array.
         - ```ts
            useEffect(() => {
                if (formState.errors.password) {
                    alert('Password is required');
                }
            }, [formState.errors]); // ❌ formState.errors will not trigger the useEffect 

            useEffect(() => {
                console.log(formState.errors, 'formState.errors');

                if (formState.errors.password) {
                    alert('Password is required');
                }
            }, [formState]); // ✅

           ``` 


```ts
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode:"onTouched",
    disabled:false,
    defaultValues:{
      email:"",
      password:""
    }
  });

  const onSubmit = (data: LoginFormData) => {
    console.log(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              {...register('email')}
            />
            {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              {...register('password')}
            />
            {errors.password && <p className="text-red-500 text-xs italic">{errors.password.message}</p>}
          </div>
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```
`FormProvider` `UseFormContext`: They can be used as the same logic of react context.It help us to avoid unnecessary prop hell.
```ts
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    age: z.number().min(18, 'You must be at least 18 years old'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const methods = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onTouched',
        disabled: false,
        defaultValues: {
            email: '',
            password: '',
            age: 0,
        },
    });
    const { handleSubmit } = methods;

    const onSubmit = (data: LoginFormData) => {
        console.log(data, 'data');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                <FormProvider {...methods}>
                    <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                        <EmailInput />
                        <PasswordInput />

                        <div className="flex items-center justify-center">
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Sign In
                            </button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}

function PasswordInput() {
    const {
        register,
        formState: { errors },
    } = useFormContext<LoginFormData>();
    return (
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
            </label>
            <input id="password" type="password" {...register('password')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            {errors.password && <p className="text-red-500 text-xs italic">{String(errors.password.message)}</p>}
        </div>
    );
}

function EmailInput() {
    const {
        register,
        formState: { errors },
    } = useFormContext<LoginFormData>();
    return (
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
            </label>
            <input id="email" type="email" {...register('email')} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            {errors.email && <p className="text-red-500 text-xs italic">{String(errors.email.message)}</p>}
        </div>
    );
}
```


- u should understand the deep reason of formState errors