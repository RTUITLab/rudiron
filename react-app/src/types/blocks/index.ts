interface BaseField  {
    name: string;
    placeholder: string;
    hardcoded: boolean;
}

interface FieldType1 extends BaseField {
    type: 1;
    values: number[] | string[];
}

interface FieldType2 extends BaseField {
    type: 2;
    values: Block[];
}

interface FieldType3 extends BaseField {
    type: 3;
    values: number[] | string[];
}

export type Field = FieldType1 | FieldType2 | FieldType3;

export interface Block {
    block_name: string;
    menu_name: string;
    category: string;
    fields: Field[];
    default_code: string;
    workspace: boolean;
}

export interface BlocksData {
    blocks: Blocks;
}

type Blocks = Block[];
export default Blocks;