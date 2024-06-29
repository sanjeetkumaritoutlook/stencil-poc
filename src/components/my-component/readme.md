# my-component



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description     | Type     | Default     |
| -------- | --------- | --------------- | -------- | ----------- |
| `first`  | `first`   | The first name  | `string` | `undefined` |
| `last`   | `last`    | The last name   | `string` | `undefined` |
| `middle` | `middle`  | The middle name | `string` | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
# how to use custom Elements (web components)
in React:
initialValue={'My Initial Value'}

in Angular:
initial-value="My Initial Value"

In Angular, variable properties use camelCase  or kebab-case
[initalValue]="myVariable"   should work


In Angular, use camelCase when it's a complex variable(and wrapped in [ ])
You should use kebab-case for primitive properties per the Custom Element Spec.
display-stepper-buttons="false"

For simple props, you should just be able to use interpolation.


React doesn't support web components natively (yet in React v18.3), so it doesn't support camelCase for Prop names-
instead React use dash-case for Primitive type Props

auto-focus={true}


for complex/reference type Props(e.g. objects,arrays,etc.), but can also be used for primitive types as well

The inline properties won't work without a ref as React doesn't support complex props on web components without them. Only primitives can be passed to web components as inline props (in React)

const inputRef = useCustomElementRef({},
{label: 'Prop Format 3 (Complex/Reference Types)', autofocus:true}
);

<fluid-input-field ref={inputRef}></fluid-input-field>
(or)
return(
<fluid-form ref={useCustomElementRef({
valueChanged: (event) => handleValueChanged(event.detail)
},{
config: formConfig,
})}/>

FLUID React utils package, which provide wrappers around the runtime components to make it easier for React development.

in React, circled props won't work
