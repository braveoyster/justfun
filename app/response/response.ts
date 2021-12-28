/* eslint-disable import/prefer-default-export */
export class Response {
  public page_count: number;

  public reference: any;

  constructor(
    public results: any[] | any,
    public total?: number,
    public page_index?: number,
    public page_size?: number,
  ) {
    if (total) this.page_count = Math.ceil(total! / page_size!);
  }
}
