/** One finding from loading or validating site data. Errors fail the build, warnings are printed. */
export interface Issue {
  level: 'error' | 'warn';
  /** Stable id of the check, e.g. `redirect-loop`. The fixtures proof script matches on these. */
  check: string;
  /** Where to look: a content type and entry, or a code file. */
  where: string;
  message: string;
}

export const error = (check: string, where: string, message: string): Issue => ({ level: 'error', check, where, message });
export const warn = (check: string, where: string, message: string): Issue => ({ level: 'warn', check, where, message });

/** Zod issues as one line each, `where` first, so the build log reads as a checklist. */
export function fromZod(where: string, issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>): Issue[] {
  return issues.map((i) => error('schema', `${where}${i.path.length ? `.${i.path.map(String).join('.')}` : ''}`, i.message));
}

/** The failure text: every issue in one readable list, errors first. */
export function formatIssues(issues: Issue[]): string {
  const rows = (level: Issue['level']) => issues.filter((i) => i.level === level).map((i) => `  - [${i.check}] ${i.where}: ${i.message}`);
  const errors = rows('error');
  const warnings = rows('warn');
  return [
    errors.length ? `${errors.length} content problem${errors.length === 1 ? '' : 's'} (the build is stopped, the last good site stays live):\n${errors.join('\n')}` : '',
    warnings.length ? `${warnings.length} warning${warnings.length === 1 ? '' : 's'}:\n${warnings.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}
