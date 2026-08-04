# Commands executed

```text
git fetch origin feature/028d-2as2-complaint-filing-closure fix/ca-h01-frontend-f4-cutover
git checkout feature/028d-2as2-complaint-filing-closure
git rev-parse HEAD
git rev-parse origin/feature/028d-2as2-complaint-filing-closure
gh pr view 8 --json number,title,state,isDraft,baseRefName,headRefName,headRefOid,mergeable,mergeStateStatus,autoMergeRequest,url,statusCheckRollup
git diff --name-only 52fd59fff195ed06026cc0385dde7004226317d7..011f652673a2a50dd71044e52ae9c2624cec4be5
npm run test:028d-2as2r   # cwd: frontend-app
gh run list --branch feature/028d-2as2-complaint-filing-closure --limit 10 --json ...
gh api repos/miljansavicmsx/CONFORA_LMS/deployments
gh run list --workflow deploy-backend.yml --limit 20 --json ...
git diff 4090be85a0f8e423d199610f82e3949c899cc90b..HEAD -- docs/TECHNICAL_DEBT_REGISTER.md
# evidence folder write
git add docs/evidence/governance/2026-08-02T23-15-00-028d-2as3-ready-for-review-closure
git commit -m "docs(repo): add 028d-2as3 ready review closure evidence"
git push origin feature/028d-2as2-complaint-filing-closure
# post-push verification (gh pr view / rev-parse / diff-tree)
```

Not executed:

- merge
- auto-merge enable
- manual check rerun
- deploy-backend dispatch
- operational source edits
