'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Schema } from '@/lib/api';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface SchemaCodeProps {
    schema: Schema;
}

type ExportFormat = 'postgresql' | 'mysql' | 'prisma' | 'drizzle' | 'json';

export default function SchemaCode({ schema }: SchemaCodeProps) {
    const [format, setFormat] = useState<ExportFormat>('postgresql');
    const [copied, setCopied] = useState(false);

    const formats: { id: ExportFormat; label: string }[] = [
        { id: 'postgresql', label: 'PostgreSQL' },
        { id: 'mysql', label: 'MySQL' },
        { id: 'prisma', label: 'Prisma' },
        { id: 'drizzle', label: 'Drizzle' },
        { id: 'json', label: 'JSON' },
    ];

    const generatedCode = useMemo(() => {
        switch (format) {
            case 'postgresql':
            case 'mysql':
                return generateSQL(schema, format);
            case 'prisma':
                return generatePrisma(schema);
            case 'drizzle':
                return generateDrizzle(schema);
            case 'json':
                return JSON.stringify(schema, null, 2);
            default:
                return '';
        }
    }, [schema, format]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const extensions: Record<ExportFormat, string> = {
            postgresql: 'sql',
            mysql: 'sql',
            prisma: 'prisma',
            drizzle: 'ts',
            json: 'json',
        };
        const blob = new Blob([generatedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schema.${extensions[format]}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]/50">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]">
                {/* Format Tabs */}
                <div className="flex items-center gap-1">
                    {formats.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFormat(f.id)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${format === f.id
                                    ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition-colors"
                    >
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
                    >
                        Download
                    </button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="h-[400px]">
                <Editor
                    height="100%"
                    language={format === 'json' ? 'json' : format === 'prisma' ? 'prisma' : format === 'drizzle' ? 'typescript' : 'sql'}
                    value={generatedCode}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                        wordWrap: 'on',
                        renderLineHighlight: 'none',
                    }}
                    theme="vs-dark"
                />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--foreground-muted)] bg-[var(--card)]">
                <span>{generatedCode.split('\n').length} lines</span>
                <span>
                    {format === 'postgresql' && 'PostgreSQL 15+'}
                    {format === 'mysql' && 'MySQL 8.0+'}
                    {format === 'prisma' && 'Prisma 5.0+'}
                    {format === 'drizzle' && 'Drizzle ORM'}
                    {format === 'json' && 'JSON Schema'}
                </span>
            </div>
        </div>
    );
}

function generateSQL(schema: Schema, dialect: 'postgresql' | 'mysql'): string {
    const lines: string[] = [
        `-- ${schema.name || 'Database Schema'}`,
        `-- Generated by SchemaCraft`,
        `-- Dialect: ${dialect.toUpperCase()}`,
        '',
    ];

    for (const table of schema.tables) {
        if (table.description) {
            lines.push(`-- ${table.description}`);
        }
        lines.push(`CREATE TABLE ${table.name} (`);

        const colDefs: string[] = [];
        for (const col of table.columns) {
            let def = `    ${col.name} ${col.type}`;
            if (col.primary_key) def += ' PRIMARY KEY';
            if (!col.nullable && !col.primary_key) def += ' NOT NULL';
            if (col.unique && !col.primary_key) def += ' UNIQUE';
            if (col.default) def += ` DEFAULT ${col.default}`;
            colDefs.push(def);
        }

        lines.push(colDefs.join(',\n'));
        lines.push(');');
        lines.push('');
    }

    if (schema.relationships.length > 0) {
        lines.push('-- Foreign Key Constraints');
        for (const rel of schema.relationships) {
            lines.push(`ALTER TABLE ${rel.from_table}`);
            lines.push(`    ADD CONSTRAINT fk_${rel.from_table}_${rel.from_column}`);
            lines.push(`    FOREIGN KEY (${rel.from_column})`);
            lines.push(`    REFERENCES ${rel.to_table}(${rel.to_column})`);
            lines.push(`    ON DELETE ${rel.on_delete || 'CASCADE'};`);
            lines.push('');
        }
    }

    const allIndexes = schema.tables.flatMap(t => t.indexes.map(idx => ({ ...idx, table: t.name })));
    if (allIndexes.length > 0) {
        lines.push('-- Indexes');
        for (const idx of allIndexes) {
            const unique = idx.unique ? 'UNIQUE ' : '';
            lines.push(`CREATE ${unique}INDEX ${idx.name} ON ${idx.table} (${idx.columns.join(', ')});`);
        }
    }

    return lines.join('\n');
}

function generatePrisma(schema: Schema): string {
    const lines: string[] = [
        '// Schema generated by SchemaCraft',
        '',
        'generator client {',
        '  provider = "prisma-client-js"',
        '}',
        '',
        'datasource db {',
        '  provider = "postgresql"',
        '  url      = env("DATABASE_URL")',
        '}',
        '',
    ];

    const typeMap: Record<string, string> = {
        'UUID': 'String @id @default(uuid())',
        'SERIAL': 'Int @id @default(autoincrement())',
        'INT': 'Int',
        'VARCHAR': 'String',
        'TEXT': 'String',
        'BOOLEAN': 'Boolean',
        'TIMESTAMP': 'DateTime',
        'DATE': 'DateTime',
        'DECIMAL': 'Decimal',
        'JSONB': 'Json',
        'JSON': 'Json',
        'INET': 'String',
    };

    for (const table of schema.tables) {
        const modelName = table.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        lines.push(`model ${modelName} {`);

        for (const col of table.columns) {
            const baseType = col.type.split('(')[0].toUpperCase();
            let prismaType = typeMap[baseType] || 'String';

            if (col.primary_key && !prismaType.includes('@id')) {
                prismaType += ' @id';
            }
            if (col.unique && !prismaType.includes('@unique') && !prismaType.includes('@id')) {
                prismaType += ' @unique';
            }
            if (col.nullable && !col.primary_key) {
                prismaType = prismaType.replace(/^(\w+)/, '$1?');
            }
            if (col.default && (col.name === 'created_at' || col.name === 'updated_at')) {
                if (col.name === 'created_at') prismaType += ' @default(now())';
                if (col.name === 'updated_at') prismaType += ' @updatedAt';
            }

            lines.push(`  ${col.name.padEnd(20)} ${prismaType}`);
        }

        lines.push('}');
        lines.push('');
    }

    return lines.join('\n');
}

function generateDrizzle(schema: Schema): string {
    const lines: string[] = [
        '// Schema generated by SchemaCraft',
        '',
        "import {",
        "  pgTable,",
        "  uuid,",
        "  varchar,",
        "  text,",
        "  timestamp,",
        "  boolean,",
        "  integer,",
        "  decimal,",
        "  jsonb,",
        "  inet,",
        "  date,",
        "} from 'drizzle-orm/pg-core';",
        '',
    ];

    for (const table of schema.tables) {
        lines.push(`export const ${table.name} = pgTable('${table.name}', {`);

        for (const col of table.columns) {
            const baseType = col.type.split('(')[0].toUpperCase();
            let drizzleType = '';

            switch (baseType) {
                case 'UUID':
                    drizzleType = `uuid('${col.name}')`;
                    if (col.primary_key) drizzleType += '.primaryKey().defaultRandom()';
                    break;
                case 'SERIAL':
                    drizzleType = `integer('${col.name}')`;
                    if (col.primary_key) drizzleType += '.primaryKey().generatedAlwaysAsIdentity()';
                    break;
                case 'INT':
                case 'INTEGER':
                    drizzleType = `integer('${col.name}')`;
                    break;
                case 'VARCHAR':
                    const len = col.type.match(/\((\d+)\)/)?.[1] || '255';
                    drizzleType = `varchar('${col.name}', { length: ${len} })`;
                    break;
                case 'TEXT':
                    drizzleType = `text('${col.name}')`;
                    break;
                case 'TIMESTAMP':
                    drizzleType = `timestamp('${col.name}')`;
                    if (col.default?.includes('NOW')) drizzleType += '.defaultNow()';
                    break;
                case 'DATE':
                    drizzleType = `date('${col.name}')`;
                    break;
                case 'BOOLEAN':
                    drizzleType = `boolean('${col.name}')`;
                    break;
                case 'DECIMAL':
                    const precision = col.type.match(/\((\d+),(\d+)\)/);
                    if (precision) {
                        drizzleType = `decimal('${col.name}', { precision: ${precision[1]}, scale: ${precision[2]} })`;
                    } else {
                        drizzleType = `decimal('${col.name}')`;
                    }
                    break;
                case 'JSONB':
                case 'JSON':
                    drizzleType = `jsonb('${col.name}')`;
                    break;
                case 'INET':
                    drizzleType = `inet('${col.name}')`;
                    break;
                default:
                    drizzleType = `text('${col.name}')`;
            }

            if (!col.nullable && !col.primary_key && !drizzleType.includes('.notNull')) {
                drizzleType += '.notNull()';
            }

            lines.push(`  ${col.name}: ${drizzleType},`);
        }

        lines.push('});');
        lines.push('');
    }

    return lines.join('\n');
}
