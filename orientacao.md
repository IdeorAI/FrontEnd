Ok precisamos fazer uma mudança no workflow do projeto , primeiro vou escrever a situação atual, depois como deve ser a situação futura e as alteracoes que voce deve fazer.
-Atualmente , voce entra no fluxo de criar uma startup(ou nova ideia) , tudo dentro da /app/idea/ . Na primeira pagina /app/idea/create voce escolhe as duas modalidades de criação uma com mais assistencia do LLM e outra com menos. Depois voce segue para a segunda parte (\*iremos fazer uma alteraçao antes dessa parte) na page /app/idea/descreva ou page /app/idea/ideorseg , nessa parte voce descreve e/ou escolhe o segmento da sua startup e na terceira parte voce escolhe entre as opçoes que a llm te fornece , pages /app/idea/ideorchoice ou /app/idea/choice , e na ultima parte os dois fluxos se unem na /app/idea/title para voce definir o titulo da startup(project) e alterar algo da descrição se necessario.Tudo é salvo no supabase a table projects tem o schema na proxima seccao desse arquivo(///supabase).

-Mudança , vamos adicionar mais uma pagina nesse fluxo de criação , entre a primeira (/app/idea/create) e a segunda(/app/idea/descreva ou page /app/idea/ideorseg) , e sera uma pagina igual para os dois workflows mas por questão de simplicidade (sequencia do flow) talvez devessemos criar duas paginas iguais (o que vc acha?). Essa pagina terá duas perguntas com respostas ja definidas para o usuario escolher (multipla escolha) e as suas respostas devem ser salvas em novas colunas no table projects do supabase . Crie o codigo em sql que preciso executar e disponibilize ele na "//claude section" no fim desse arquivo.
Depois de responder essa perguntas o flow deve serguir igual está atualmente. O layout da pagina deve
ser igual a das outras (cores , letras, espaçamento...) tudo igual /app/idea/layout.tsx .

Primeira pergunta e alternativas :
"
*1 - Qual é a estrutura principal do seu produto digital neste MVP?

SaaS (software como serviço)

Marketplace (conecta dois lados)

App (Web ou Mobile)

API/Plataforma para desenvolvedores

Não sei/prefiro não definir (o Ideor pode sugerir a melhor opção).
"
segunda pergunta e alternativas:
"
*2- Qual é o público-alvo principal deste MVP?

B2B (empresas/organizações)

B2C (consumidores finais)

Híbrido (B2B2C)

Não sei/prefiro não definir (o Ideor pode sugerir a melhor opção).
"
///supabase 
projects table schema:

create table public.projects (
id uuid not null default gen_random_uuid (),
owner_id uuid not null,
name character varying(100) not null,
description text null,
score numeric(3, 1) not null default 0.0,
valuation numeric(10, 2) not null default 250.00,
progress_breakdown jsonb not null default '{}'::jsonb,
current_phase character varying(20) not null default 'fase1'::character varying,
created_at timestamp with time zone not null default now(),
updated_at timestamp with time zone not null default now(),
category character varying(50) null,
generated_options text[] null,
constraint projects_pkey primary key (id),
constraint projects_owner_id_fkey foreign KEY (owner_id) references profiles (id) on delete CASCADE,
constraint projects_category_check check (
(
(category is null)
or (
(category)::text = any (
(
array[
'software-ia-dados'::character varying,
'financas-seguros'::character varying,
'saude-ciencias-vida'::character varying,
'varejo-ecommerce-marketing'::character varying,
'industria-manufatura-iot'::character varying,
'logistica-mobilidade-transporte'::character varying,
'energia-clima-sustentabilidade'::character varying,
'imoveis-construcao'::character varying,
'educacao-rh'::character varying,
'seguranca-infraestrutura-digital'::character varying,
'governo-juridico-setor-publico'::character varying,
'midia-entretenimento-criadores'::character varying
]
)::text[]
)
)
)
),
constraint projects_description_len check (
(
(description is null)
or (length(description) <= 400)
)
),
constraint projects_score_check check (
(
(score >= (0)::numeric)
and (score <= (10)::numeric)
)
),
constraint projects_valuation_check check ((valuation >= (0)::numeric))
) TABLESPACE pg_default;

create unique INDEX IF not exists ux_projects_owner_name on public.projects using btree (owner_id, lower((name)::text)) TABLESPACE pg_default;

create index IF not exists idx_projects_owner_id on public.projects using btree (owner_id) TABLESPACE pg_default;

create trigger trg_projects_add_owner
after INSERT on projects for EACH row
execute FUNCTION add_owner_as_member ();

create trigger trg_projects_updated_at BEFORE
update on projects for EACH row
execute FUNCTION set_updated_at ();

---

schema da tabel profile :

create table public.profiles (
id uuid not null,
username character varying(50) null,
created_at timestamp with time zone null default now(),
email text not null,
updated_at timestamp with time zone null default now(),
constraint profiles_pkey primary key (id),
constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

--------------------


//claude section

-- SQL para adicionar novas colunas no projects table
-- Execute este código no Supabase SQL Editor

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS product_structure character varying(100) NULL,
ADD COLUMN IF NOT EXISTS target_audience character varying(50) NULL;

-- Adicionar comentários nas colunas para documentação
COMMENT ON COLUMN public.projects.product_structure IS 'Estrutura principal do produto: SaaS, Marketplace, App, API/Plataforma, ou Não definido';
COMMENT ON COLUMN public.projects.target_audience IS 'Público-alvo: B2B, B2C, Híbrido, ou Não definido';

-- Constraint opcional para validar os valores (remova se quiser mais flexibilidade)
ALTER TABLE public.projects
ADD CONSTRAINT projects_product_structure_check CHECK (
  product_structure IS NULL OR product_structure IN (
    'SaaS (software como serviço)',
    'Marketplace (conecta dois lados)',
    'App (Web ou Mobile)',
    'API/Plataforma para desenvolvedores',
    'Não sei/prefiro não definir'
  )
);

ALTER TABLE public.projects
ADD CONSTRAINT projects_target_audience_check CHECK (
  target_audience IS NULL OR target_audience IN (
    'B2B (empresas/organizações)',
    'B2C (consumidores finais)',
    'Híbrido (B2B2C)',
    'Não sei/prefiro não definir'
  )
);