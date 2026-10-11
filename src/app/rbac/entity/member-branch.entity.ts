export class MemberBranch {
    memberId: number;
    branchId: number;

    constructor(data: Partial<MemberBranch>) {
        this.memberId = data.memberId!;
        this.branchId = data.branchId!;
    }
}