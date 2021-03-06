// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React from 'react';
import { FieldProps, UIOptions } from '@bfc/extension';

import { resolvePropSchema } from '../utils';

import { SchemaField } from './SchemaField';

export interface FormRowProps extends Omit<FieldProps, 'onChange'> {
  onChange: (field: string) => (data: any) => void;
  row: string | [string, string];
}

export const getRowProps = (rowProps: FormRowProps, field: string) => {
  const {
    id,
    depth,
    schema,
    definitions,
    value,
    uiOptions,
    transparentBorder,
    className,
    label,
    rawErrors,
    onBlur,
    onFocus,
    onChange,
  } = rowProps;

  const { required = [] } = schema;
  const fieldSchema = resolvePropSchema(schema, field, definitions);

  return {
    id: `${id}.${field}`,
    schema: fieldSchema ?? {},
    label: (label === false ? false : undefined) as false | undefined,
    name: field,
    rawErrors: rawErrors?.[field],
    required: required.includes(field),
    uiOptions: (uiOptions.properties?.[field] as UIOptions) ?? {},
    value: value && value[field],
    onChange: onChange(field),
    depth,
    definitions,
    transparentBorder,
    className,
    onBlur,
    onFocus,
  };
};

const formRow = {
  row: css`
    display: flex;
    margin: 10px 18px;

    label: FormRowContainer;
  `,
  property: css`
    flex: 1;
    margin: 0;

    & + & {
      margin-left: 16px;
    }

    label: FormRowProperty;
  `,
  full: css`
    flex: 1;

    label: FormRow;
  `,
};

const FormRow: React.FC<FormRowProps> = (props) => {
  const { id, row } = props;

  if (Array.isArray(row)) {
    return (
      <div css={formRow.row}>
        {row.map((property) => (
          <SchemaField key={`${id}.${property}`} css={formRow.property} {...getRowProps(props, property)} />
        ))}
      </div>
    );
  }
  return <SchemaField key={`${id}.${row}`} css={formRow.full} {...getRowProps(props, row)} />;
};

export { FormRow };
