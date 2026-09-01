import { useState } from "react";
import styled, { css } from "styled-components";

import Button from "../../../../components/Button";
import Card from "../../../../components/Card";
import CopyButton from "../../../../components/Button/Copy";
import Input from "../../../../components/Input";
import Select from "../../../../components/Select";
import Text from "../../../../components/Text";
import Topbar from "../../../../components/Topbar";
import { ExportFile, Warning } from "../../../../components/Icons";
import { PgCodec, PgCommon, PgWeb3 } from "../../../../utils";

interface KeyTypeOption {
  value: string;
  label: string;
}

/** Supported SSH key types that can be generated in the browser. */
const KEY_TYPES: KeyTypeOption[] = [{ value: "ed25519", label: "ED25519" }];

const SshKeyGenerator = () => {
  const [name, setName] = useState("my-ssh-key");
  const [error, setError] = useState("");
  const [keyType, setKeyType] = useState<KeyTypeOption>(KEY_TYPES[0]);
  const [keypair, setKeypair] = useState<PgWeb3.Keypair>();

  const publicKey = keypair?.publicKey.toBase58();
  // `secretKey` is the full 64-byte Solana keypair (32-byte seed + 32-byte
  // public key), matching the same format used for wallet keypair exports
  // (see `PgWallet.export`), encoded as base58.
  const privateKey =
    keypair && PgCodec.encodeBinary(keypair.secretKey, "base58");

  const handleGenerate = () => {
    if (error || !name) return;
    setKeypair(PgWeb3.Keypair.generate());
  };

  const canGenerate = !error && !!name;

  const handleDownload = () => {
    if (!privateKey) return;
    PgCommon.export(
      `${PgCommon.toKebabFromTitle(name)}-private-key.txt`,
      privateKey
    );
  };

  return (
    <Wrapper>
      <TopSection>
        <Title>SSH Key Generator</Title>
      </TopSection>

      <MainSection>
        <Desc>
          Generate a new Ed25519 key pair entirely in your browser. The keys are
          never sent to any server. The generated public/private key pair uses
          the same encoding as Solana keypairs (base58), rather than the OpenSSH
          PEM format.
        </Desc>

        <InputWrapper>
          <InputLabel>Key name</InputLabel>
          <Input
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            error={error}
            setError={setError}
            validator={(value) => {
              if (!value) throw new Error("Key name cannot be empty");
            }}
            placeholder="e.g. my-server-key"
          />
        </InputWrapper>

        <InputWrapper>
          <InputLabel>Key type</InputLabel>
          <Select
            options={KEY_TYPES}
            value={keyType}
            onChange={(option) => {
              if (option) setKeyType(option);
            }}
          />
        </InputWrapper>

        <GenerateButtonWrapper>
          <Button
            kind="primary"
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            Generate key pair
          </Button>
        </GenerateButtonWrapper>

        {keypair && publicKey && privateKey && (
          <ResultCard>
            <ResultRow>
              <ResultLabel>Public key</ResultLabel>
              <ResultValueWrapper>
                <ResultValue>{publicKey}</ResultValue>
                <CopyButton copyText={publicKey} />
              </ResultValueWrapper>
            </ResultRow>

            <ResultRow>
              <ResultLabel>Private key</ResultLabel>
              <ResultValueWrapper>
                <ResultValue>{privateKey}</ResultValue>
                <CopyButton copyText={privateKey} />
                <Button kind="icon" onClick={handleDownload} title="Download">
                  <ExportFile />
                </Button>
              </ResultValueWrapper>
            </ResultRow>

            <WarningTextWrapper>
              <Text kind="warning" icon={<Warning />}>
                Store your private key securely and never share it with anyone.
                Anyone with access to the private key has full control over the
                associated identity. This key is not saved anywhere by the
                playground &mdash; if you leave this page without saving it, it
                will be lost forever.
              </Text>
            </WarningTextWrapper>
          </ResultCard>
        )}
      </MainSection>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    font-family: ${theme.font.other.family};
    font-size: ${theme.font.other.size.medium};
  `}
`;

const TopSection = styled(Topbar)`
  height: 4.5rem;
  padding: 1rem 2.5rem;
`;

const Title = styled.h1``;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem 2.5rem;
  max-width: 40rem;
`;

const Desc = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.font.code.size.small};
    color: ${theme.colors.default.textSecondary};
    margin-bottom: 1rem;
  `}
`;

const InputWrapper = styled.div`
  margin-top: 0.75rem;
`;

const InputLabel = styled.div`
  margin-bottom: 0.25rem;
  font-weight: bold;
`;

const GenerateButtonWrapper = styled.div`
  margin-top: 1.5rem;
  width: fit-content;
`;

const ResultCard = styled(Card)`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  padding: 1rem;
`;

const ResultRow = styled.div`
  &:not(:first-child) {
    margin-top: 1rem;
  }
`;

const ResultLabel = styled.div`
  margin-bottom: 0.25rem;
  font-weight: bold;
`;

const ResultValueWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ResultValue = styled.span`
  ${({ theme }) => css`
    font-family: ${theme.font.code.family};
    font-size: ${theme.font.code.size.small};
    word-break: break-all;
    flex: 1;
  `}
`;

const WarningTextWrapper = styled.div`
  margin-top: 1.25rem;
  display: flex;
  align-items: center;

  & svg {
    height: 2rem;
    width: 2rem;
    margin-right: 1rem;
    flex-shrink: 0;
  }
`;

export default SshKeyGenerator;
