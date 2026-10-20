import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const arg=(name,fallback)=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:fallback;
const root=path.resolve(arg('--source',process.cwd()));
const out=path.resolve(arg('--out',path.join(root,'supabase/functions/admin-reports/catalogue.json')));
const require=createRequire(path.join(root,'package.json'));
const ts=require('typescript');
const hashes={};
function literalExport(file,name) {
  const source=fs.readFileSync(path.join(root,file),'utf8');
  hashes[file]=crypto.createHash('sha256').update(source).digest('hex');
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  const vars=new Map();
  for (const statement of ast.statements) if (ts.isVariableStatement(statement))
    for (const decl of statement.declarationList.declarations) vars.set(decl.name.getText(ast),decl.initializer);
  const value=(node)=>{
    if (!node) throw Error(`Missing literal ${name} in ${file}`);
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind===ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind===ts.SyntaxKind.FalseKeyword) return false;
    if (node.kind===ts.SyntaxKind.NullKeyword) return null;
    if (ts.isIdentifier(node)) { if (node.text==='undefined') return null; return value(vars.get(node.text)); }
    if (ts.isParenthesizedExpression(node)) return value(node.expression);
    if (ts.isPrefixUnaryExpression(node) && node.operator===ts.SyntaxKind.MinusToken) return -value(node.operand);
    if (ts.isArrayLiteralExpression(node)) return node.elements.flatMap(n=>ts.isSpreadElement(n)?value(n.expression):[value(n)]);
    if (ts.isObjectLiteralExpression(node)) {
      const obj={};
      for (const prop of node.properties) {
        if (ts.isSpreadAssignment(prop)) Object.assign(obj,value(prop.expression));
        else if (ts.isPropertyAssignment(prop)) obj[prop.name.text ?? prop.name.getText(ast)]=value(prop.initializer);
        else throw Error(`Non-literal property in ${file}`);
      }
      return obj;
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind===ts.SyntaxKind.PlusToken) return value(node.left)+value(node.right);
    throw Error(`Non-literal catalogue expression in ${file}: ${node.getText(ast).slice(0,100)}`);
  };
  return value(vars.get(name));
}
const sections={vr:'VerbalReasoning',dm:'DecisionMaking',qr:'QuantitativeReasoning',sj:'SituationalJudgement'};
const catalogue={lessons:{},questions:{},provenance:{source:'FutureDoc source snapshot',sha256:hashes}};
for (const [section,name] of Object.entries(sections)) {
  const modules=literalExport(`src/screens/learn/${name}LearnScreen.js`,'MODULES');
  const worked=literalExport(`src/data/learn/${section}WorkedExamples.js`,`${section.toUpperCase()}_WORKED_EXAMPLES`);
  let number=0;
  for (const module of modules) for (const lesson of module.lessons) catalogue.lessons[`${section}:${lesson.id}`]={
    ...lesson,section,number:++number,moduleId:module.id,moduleTitle:module.title,workedExample:worked[lesson.id] ?? null,
  };
  const suffix={vr:'PASSAGE',dm:'QUESTION',qr:'SET',sj:'SCENARIO'}[section];
  const demo=literalExport(`src/data/demo/${section}TutorDemoQuestion.js`,`${section.toUpperCase()}_TUTOR_DEMO_${suffix}`);
  for (const bundle of [demo,...Object.values(worked)]) {
    for (const question of bundle.questions || [bundle]) {
      const id=question.questionId || question.id;
      catalogue.questions[`${section}:${id}`]={
        ...question,id,section,mode:bundle===demo?'demo':'practice',current:true,
        title:bundle.title || '',context:bundle.resource || '',stimulus:bundle.stimulus || null,
        explanation:question.answeringReason,questionText:question.questionText || question.stem || '',
      };
    }
  }
}
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(catalogue,null,2)+'\n');
console.log(`Exported ${Object.keys(catalogue.lessons).length} lessons and ${Object.keys(catalogue.questions).length} bundled questions.`);
